import * as p from "paillier-bigint";
import { SealService } from "src/services/sealService";

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

  encryptSeal(sealService: SealService) {
    let cholesterolArray = Int32Array.from([this.cholesterol]);
    let bloodPressureArray = Int32Array.from([this.bloodPressure]);

    let cholesterolPlainText = sealService.encoder.encode(cholesterolArray);
    let bloodPressurePlainText = sealService.encoder.encode(bloodPressureArray);

    let cholesterolCipherText = sealService.encryptor.encrypt(cholesterolPlainText);
    let bloodPressureCipherText = sealService.encryptor.encrypt(bloodPressurePlainText);

    let result = new EncryptedHealthDataSeal();
    result.cholesterol = cholesterolCipherText;
    result.bloodPressure = bloodPressureCipherText;

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
  cholesterol: any;
  bloodPressure: any;

  decrypt(sealService: SealService) {
    let cholesterolDecryptedPlainText = sealService.decryptor.decrypt(this.cholesterol);
    let bloodPressureDecryptedPlainText = sealService.decryptor.decrypt(this.bloodPressure);

    let cholesterolDecodedArray = sealService.encoder.decode(cholesterolDecryptedPlainText);
    let bloodPressureDecodedArray = sealService.encoder.decode(bloodPressureDecryptedPlainText);

    let result = new HealthData();
    result.cholesterol = cholesterolDecodedArray[0];
    result.bloodPressure = bloodPressureDecodedArray[0];

    return result;
  }

  toJson() {
    return JSON.stringify({
      cholesterol: this.cholesterol.save(),
      bloodPressure: this.bloodPressure.save(),
    });
  }

  static fromJson(data: string, sealService: SealService) {
    let dataJson: any = JSON.parse(data);

    let cholesterolCipherText = sealService.createCipherText();
    let bloodPressureCipherText = sealService.createCipherText();

    cholesterolCipherText.load(sealService.context, dataJson["cholesterol"]);
    bloodPressureCipherText.load(sealService.context, dataJson["bloodPressure"]);

    let hpData = new EncryptedHealthDataSeal();
    hpData.cholesterol = cholesterolCipherText;
    hpData.bloodPressure = bloodPressureCipherText;

    return hpData;
  }
}
