import * as zmq from "zeromq";
import { PatientService } from "../services/patientService";
import { Config } from "../models/config";

export class PaillierExample {
  private patientService: PatientService;

  constructor(patientService: PatientService) {
    this.patientService = patientService;
  }

  async getPatientsData(socket: zmq.Reply) {
    let patients = await this.patientService.getAllPatients();

    let data = {
      patients: patients.map((patient) => {
        let hpData = patient.healthDataPaillier;

        return {
          aid: patient.aid,
          cholesterol: hpData.cholesterol.toString(),
          bloodPressure: hpData.bloodPressure.toString(),
        };
      }),
    };

    await socket.send(JSON.stringify(data));
  }
}
