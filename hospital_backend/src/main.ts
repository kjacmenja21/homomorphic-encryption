import * as zmq from "zeromq";
import { Config } from "./models/config";
import { PatientService } from "./services/patientService";

async function main() {
  let config = await Config.load();
  let socket = new zmq.Reply();

  await socket.bind("tcp://localhost:" + config.zmqPort);

  for await (let [msg] of socket) {
    let data = JSON.parse(msg.toString());
    await handleRequest(socket, data);
  }
}

async function handleRequest(socket: zmq.Reply, data: any) {
  let type = data.type;

  switch (type) {
    case "get-patients-data-paillier":
      await getPatientsDataPaillier(socket);
      break;
  }
}

async function getPatientsDataPaillier(socket: zmq.Reply) {
  let patientService = new PatientService();
  let patients = await patientService.getPatients();

  let data = {
    patients: patients.map((e) => {
      return {
        aid: e.aid,
        cholesterol: e.healthData.cholesterol.toString(),
        bloodPressure: e.healthData.bloodPressure.toString(),
      };
    }),
  };

  await socket.send(JSON.stringify(data));
}

main();
