import { Patient, PatientDecrypted } from "../models/patient";
import { HealthData } from "../models/healthData";
import { Config } from "../models/config";
import { PatientRepository } from "./patientRepository";
import { SealService } from "./sealService";

export class PatientService {
  private config: Config;
  private patientRepo: PatientRepository;
  sealService: SealService;

  constructor(config: Config, sealService: SealService) {
    this.config = config;
    this.patientRepo = new PatientRepository(sealService);
    this.sealService = sealService;
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
    let hpSeal = hpData.encryptSeal(this.sealService);

    await this.patientRepo.updatePatientHealthData(oib, hpPaillier, hpSeal);
  }

  decryptPatient(patient: Patient) {
    let paillierPrivateKey = this.config.paillierKeys.privateKey;

    let hpPaillier = patient.healthDataPaillier.decrypt(paillierPrivateKey);
    let hpSeal = patient.healthDataSeal.decrypt(this.sealService);

    return new PatientDecrypted(patient, hpPaillier, hpSeal);
  }

  decryptDiabetesPaillier(diabetesText: string) {
    let diabetesEncrypted = BigInt(diabetesText);
    let privateKey = this.config.paillierKeys.privateKey;

    let diabetes = privateKey.decrypt(diabetesEncrypted);

    return Number(diabetes);
  }

  decryptDiabetesSeal(diabetesText: string) {
    let cipherText = this.sealService.createCipherText();
    cipherText.load(this.sealService.context, diabetesText);

    let decryptedPlainText = this.sealService.decryptor.decrypt(cipherText);
    let decodedArray = this.sealService.encoder.decode(decryptedPlainText);

    let diabetes = Number(decodedArray[0]);
    return diabetes;
  }
}
