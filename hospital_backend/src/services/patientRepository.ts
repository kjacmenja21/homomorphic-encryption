import { Patient } from "../models/patient";
import { EncryptedHealthDataPaillier, EncryptedHealthDataSeal } from "../models/healthData";

import { DatabaseConnection } from "./databaseConnection";

export class PatientRepository {
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
      e.healthDataSeal = EncryptedHealthDataSeal.fromJson(hpSeal);
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
      $healthDataSeal: hpSeal.toJson(),
      $oib: oib,
    });

    db.close();
  }
}
