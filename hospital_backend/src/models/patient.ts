export class Patient {
  id: number;

  oib: string;
  firstName: string;
  lastName: string;
  birthDate: string;

  healthData: EncryptedHealthData;
}

export class EncryptedHealthData {
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

    let hpData = new EncryptedHealthData();
    hpData.cholesterol = BigInt(data.cholesterol);
    hpData.bloodPressure = BigInt(data.bloodPressure);

    return hpData;
  }
}

export class HealthData {
  cholesterol: number;
  bloodPressure: number;
}
