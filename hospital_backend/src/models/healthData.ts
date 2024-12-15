import * as p from "paillier-bigint";

export class HealthData {
  cholesterol: number;
  bloodPressure: number;

  encryptPaillier(publicKey: p.PublicKey) {
    let cholesterol: bigint = publicKey.encrypt(BigInt(this.cholesterol));
    let bloodPressure: bigint = publicKey.encrypt(BigInt(this.bloodPressure));

    let result = new EncryptedHealthDataPaillier();
    result.cholesterol = cholesterol;
    result.bloodPressure = bloodPressure;

    return result;
  }
}

export class EncryptedHealthDataPaillier {
  cholesterol: bigint;
  bloodPressure: bigint;

  decrypt(privateKey: p.PrivateKey) {
    let cholesterol: bigint = privateKey.decrypt(this.cholesterol);
    let bloodPressure: bigint = privateKey.decrypt(this.bloodPressure);

    let result = new HealthData();
    result.cholesterol = Number(cholesterol);
    result.bloodPressure = Number(bloodPressure);

    return result;
  }

  toJson() {
    let data = {
      cholesterol: this.cholesterol.toString(),
      bloodPressure: this.bloodPressure.toString(),
    };

    return JSON.stringify(data);
  }

  static fromJson(json: string) {
    let data = JSON.parse(json);

    let hpData = new EncryptedHealthDataPaillier();
    hpData.cholesterol = BigInt(data.cholesterol);
    hpData.bloodPressure = BigInt(data.bloodPressure);

    return hpData;
  }
}

export class EncryptedHealthDataSeal {
  cholesterol: bigint;
  bloodPressure: bigint;

  toJson() {
    let data = {
      cholesterol: this.cholesterol.toString(),
      bloodPressure: this.bloodPressure.toString(),
    };

    return JSON.stringify(data);
  }

  static fromJson(json: string) {
    let data = JSON.parse(json);

    let hpData = new EncryptedHealthDataSeal();
    hpData.cholesterol = BigInt(data.cholesterol);
    hpData.bloodPressure = BigInt(data.bloodPressure);

    return hpData;
  }
}
