import { Patient } from "../models/patient";
import { EncryptedHealthDataPaillier, EncryptedHealthDataSeal } from "../models/healthData";

import { DatabaseConnection } from "./databaseConnection";
import { SealService } from "./sealService";

export class PatientRepository {
  private sealService: SealService;

  constructor(sealService: SealService) {
    this.sealService = sealService;
  }

  async getPatients(): Promise<Patient[]> {
    let db = new DatabaseConnection();
    db.open();

    let sql = "SELECT * FROM Patients;";
    let result = await db.getAll(sql);

    result = result.filter((e) => {
      let hpPaillier = e.healthDataPaillier;
      let hpSeal = e.healthDataSeal;

      return hpPaillier != "" && hpSeal != "";
    });

    result = result.map((e) => {
      let hpPaillier = e.healthDataPaillier;
      let hpSeal = e.healthDataSeal;

      e.healthDataPaillier = EncryptedHealthDataPaillier.fromJson(hpPaillier);
      e.healthDataSeal = EncryptedHealthDataSeal.load(hpSeal, this.sealService);
      return e;
    });

    db.close();
    return result as Patient[];
  }

  async updatePatientHealthData(oib: string, hpPaillier: EncryptedHealthDataPaillier, hpSeal: EncryptedHealthDataSeal) {
    let db = new DatabaseConnection();
    db.open();

    let sql = "UPDATE Patients";
    sql += " SET healthDataPaillier = $healthDataPaillier, healthDataSeal = $healthDataSeal";
    sql += " WHERE oib == $oib;";

    await db.run(sql, {
      $healthDataPaillier: hpPaillier.toJson(),
      $healthDataSeal: hpSeal.save(),
      $oib: oib,
    });

    db.close();
  }
}
