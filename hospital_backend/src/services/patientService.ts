import * as p from "paillier-bigint";

import { EncryptedHealthData, HealthData, Patient } from "../models/patient";
import { DatabaseConnection } from "./databaseConnection";

export class PatientService {
  async getPatients() {
    let db = new DatabaseConnection();
    db.open();

    let sql = "SELECT * FROM Patients;";
    let result = await db.getAll(sql);

    result = result.map((e) => {
      e.healthData = EncryptedHealthData.fromJson(e.healthData);
      return e;
    });

    db.close();
    return result as Patient[];
  }

  async insertPatient(patient: Patient) {
    let db = new DatabaseConnection();
    db.open();

    let sql = "INSERT INTO Patients";
    sql += " (oib, firstName, lastName, birthDate, healthData)";
    sql += " VALUES ($oib, $firstName, $lastName, $birthDate, $healthData);";

    await db.run(sql, {
      $oib: patient.oib,
      $firstName: patient.firstName,
      $lastName: patient.lastName,
      $birthDate: patient.birthDate,
      $healthData: patient.healthData.toJson(),
    });

    db.close();
  }

  encryptHealthData(healthData: HealthData, publicKey: p.PublicKey) {
    let cholesterol: bigint = publicKey.encrypt(BigInt(healthData.cholesterol));
    let bloodPressure: bigint = publicKey.encrypt(BigInt(healthData.bloodPressure));

    let result = new EncryptedHealthData();
    result.cholesterol = cholesterol;
    result.bloodPressure = bloodPressure;

    return result;
  }

  decryptHealthData(healthData: EncryptedHealthData, privateKey: p.PrivateKey) {
    let cholesterol: bigint = privateKey.decrypt(healthData.cholesterol);
    let bloodPressure: bigint = privateKey.decrypt(healthData.bloodPressure);

    let result = new HealthData();
    result.cholesterol = Number(cholesterol);
    result.bloodPressure = Number(bloodPressure);

    return result;
  }
}
