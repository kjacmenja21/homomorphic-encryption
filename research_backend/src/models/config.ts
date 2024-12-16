enum RequestType {
  PAILLIER = "get-patients-data-paillier",
  SEAL = "get-patients-data-seal",
}

export class Config {
  request_interval_seconds: number = 5;
  request_type: RequestType = RequestType.SEAL;
  pause: boolean = false;
}
