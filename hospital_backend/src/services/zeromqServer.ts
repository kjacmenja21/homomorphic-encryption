import * as zmq from "zeromq";
import { Config } from "../models/config";
import { PatientService } from "./patientService";

export class ZeromqServer {
  private config: Config;
  private patientService: PatientService;
  private socket: zmq.Reply;

  constructor(config: Config, patientService: PatientService) {
    this.config = config;
    this.patientService = patientService;
  }

  async start() {
    this.socket = new zmq.Reply();

    await this.socket.bind("tcp://localhost:" + this.config.zmqPort);

    for await (let [msg] of this.socket) {
      let data = JSON.parse(msg.toString());

      await this.handleZeromqRequest(data);
    }
  }

  async handleZeromqRequest(data: any) {
    let type = data.type;

    switch (type) {
      case "get-patients-data-paillier":
        await this.getPatientsDataPaillier(data);
        break;

      case "decrypt-diabetes-results-paillier":
        await this.decryptDiabetesResultsPaillier(data);
        break;

      case "get-patients-data-seal":
        await this.getPatientsDataSeal(data);
        break;

      case "decrypt-diabetes-results-seal":
        await this.decryptDiabetesResultsSeal(data);
        break;
    }
  }

  async getPatientsDataPaillier(inputData: any) {
    let patients = await this.patientService.getAllPatients();

    let publicKey = this.config.paillierKeys.publicKey;

    let data = {
      type: "patients-data-paillier",

      publicKey: {
        n: publicKey.n.toString(),
        g: publicKey.g.toString(),
      },

      patients: patients.map((patient) => {
        let hpData = patient.healthDataPaillier;

        return {
          aid: patient.aid,
          cholesterol: hpData.cholesterol.toString(),
          bloodPressure: hpData.bloodPressure.toString(),
        };
      }),
    };

    await this.socket.send(JSON.stringify(data));
  }

  async decryptDiabetesResultsPaillier(inputData: any) {
    let patients = inputData.patients;

    let data = {
      patients: patients.map((patient: any) => {
        let diabetes = this.patientService.decryptDiabetesPaillier(patient.diabetes);

        return {
          aid: patient.aid,
          diabetes: diabetes,
        };
      }),
    };

    await this.socket.send(JSON.stringify(data));
  }

  async getPatientsDataSeal(inputData: any) {
    let patients = await this.patientService.getAllPatients();

    let sealService = this.patientService.sealService;

    let data = {
      type: "patients-data-seal",

      publicKey: sealService.encodePublicKey(),

      patients: patients.map((patient) => {
        let hpData = patient.healthDataSeal;

        return {
          aid: patient.aid,
          cholesterol: hpData.cholesterol.save(),
          bloodPressure: hpData.bloodPressure.save(),
        };
      }),
    };

    await this.socket.send(JSON.stringify(data));
  }

  async decryptDiabetesResultsSeal(inputData: any) {
    let patients = inputData.patients;

    let data = {
      patients: patients.map((patient: any) => {
        let diabetes = this.patientService.decryptDiabetesSeal(patient.diabetes);

        return {
          aid: patient.aid,
          diabetes: diabetes,
        };
      }),
    };

    await this.socket.send(JSON.stringify(data));
  }
}
