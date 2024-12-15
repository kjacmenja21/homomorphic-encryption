import { EncryptedHealthDataPaillier, EncryptedHealthDataSeal, HealthData } from "./healthData";

export class Patient {
  id: number;
  aid: number;

  oib: string;
  firstName: string;
  lastName: string;
  birthDate: string;

  healthDataPaillier: EncryptedHealthDataPaillier;
  healthDataSeal: EncryptedHealthDataSeal;
}

export class PatientDecrypted {
  id: number;
  aid: number;

  oib: string;
  firstName: string;
  lastName: string;
  birthDate: string;

  healthDataPaillier: HealthData;
  healthDataSeal: HealthData;

  constructor(patient: Patient, hpPaillier: HealthData, hpSeal: HealthData) {
    this.id = patient.id;
    this.aid = patient.aid;
    this.oib = patient.oib;

    this.firstName = patient.firstName;
    this.lastName = patient.lastName;
    this.birthDate = patient.birthDate;

    this.healthDataPaillier = hpPaillier;
    this.healthDataSeal = hpSeal;
  }
}
