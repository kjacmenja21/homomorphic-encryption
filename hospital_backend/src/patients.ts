import { PatientService } from "./services/patientService";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import { PaillierService } from "./services/paillierService";

async function insert(oib: string, firstName: string, lastName: string, birthDate: string, cholesterol: number, bloodPressure: number) {
  let env = await fs.readFile("./secret/secret.env", "utf8");
  let config = dotenv.parse(env);

  let pService = new PaillierService();

  let publicKey = pService.decodePublicKey(config["PAILLIER_PUBLIC_KEY"]);

  let patientService = new PatientService();

  let healthData = patientService.encryptHealthData(
    {
      cholesterol,
      bloodPressure,
    },
    publicKey
  );

  await patientService.insertPatient({
    id: 0,
    oib,
    firstName,
    lastName,
    birthDate,
    healthData,
  });
}

async function list() {
  let env = await fs.readFile("./secret/secret.env", "utf8");
  let config = dotenv.parse(env);

  let pService = new PaillierService();

  let publicKey = pService.decodePublicKey(config["PAILLIER_PUBLIC_KEY"]);
  let privateKey = pService.decodePrivateKey(config["PAILLIER_PRIVATE_KEY"], publicKey);

  let patientService = new PatientService();
  let patients = await patientService.getPatients();

  for (let patient of patients) {
    let hpData = patientService.decryptHealthData(patient.healthData, privateKey);
    console.log(`${patient.oib} ${patient.firstName} ${patient.lastName}`);
    console.log(`  ${hpData.cholesterol} ${hpData.bloodPressure}`);
  }
}

//insert("10000", "Bruno", "Brunić", "2000-01-01", 100, 200);
//insert("20000", "Maja", "Majić", "2000-01-01", 110, 210);

list();
