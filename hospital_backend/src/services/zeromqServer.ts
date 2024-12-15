import * as zmq from "zeromq";
import { Config } from "../models/config";
import { PatientService } from "./patientService";

export class ZeromqServer {
  private config: Config;
  private patientService: PatientService;

  constructor(config: Config, patientService: PatientService) {
    this.config = config;
    this.patientService = patientService;
  }

  async start() {
    let socket = new zmq.Reply();

    await socket.bind("tcp://localhost:" + this.config.zmqPort);

    for await (let [msg] of socket) {
      let data = JSON.parse(msg.toString());

      await this.handleZeromqRequest(socket, data);
    }
  }

  async handleZeromqRequest(socket: zmq.Reply, data: any) {
    let type = data.type;

    switch (type) {
      case "get-patients-data-paillier":
        await this.getPatientsDataPaillier(socket);
        break;
      case "get-patients-data-seal":
        await this.getPatientsDataSeal(socket);
        break;
    }
  }

  async getPatientsDataPaillier(socket: zmq.Reply) {
    let patients = await this.patientService.getAllPatients();

    let publicKey = this.config.paillierKeys.publicKey;

    let data = {
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

    await socket.send(JSON.stringify(data));
  }

  async getPatientsDataSeal(socket: zmq.Reply) {
    let patients = await this.patientService.getAllPatients();

    let sealService = this.patientService.sealService;

    let data = {
      publicKey: sealService.encodePublicKey(),

      patients: patients.map((patient) => {
        let hpData = patient.healthDataSeal;

        return {
          aid: patient.aid,
          cipherText: hpData.save(),
        };
      }),
    };

    await socket.send(JSON.stringify(data));
  }
}
