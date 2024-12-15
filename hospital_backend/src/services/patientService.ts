import { Patient, PatientDecrypted } from "../models/patient";
import { HealthData } from "../models/healthData";
import { Config } from "../models/config";
import { PatientRepository } from "./patientRepository";

export class PatientService {
  private config: Config;
  private patientRepo: PatientRepository;

  constructor(config: Config) {
    this.config = config;
    this.patientRepo = new PatientRepository();
  }

  async getAllPatients() {
    let patients = await this.patientRepo.getPatients();
    return patients;
  }

  async getPatientsDecrypted() {
    let patients = await this.patientRepo.getPatients();
    return patients.map((p) => this.decryptPatient(p));
  }

  async updatePatientHealthData(oib: string, hpData: HealthData) {
    let paillierPublicKey = this.config.paillierKeys.publicKey;

    let hpPaillier = hpData.encryptPaillier(paillierPublicKey);
    let hpSeal = hpPaillier;

    await this.patientRepo.updatePatientHealthData(oib, hpPaillier, hpSeal);
  }

  decryptPatient(patient: Patient) {
    let paillierPrivateKey = this.config.paillierKeys.privateKey;

    let hpPaillier = patient.healthDataPaillier.decrypt(paillierPrivateKey);
    let hpSeal = hpPaillier;

    return new PatientDecrypted(patient, hpPaillier, hpSeal);
  }
}
