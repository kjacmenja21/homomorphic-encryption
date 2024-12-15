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
    let array = Int32Array.from([this.cholesterol, this.bloodPressure]);

    let plainText = sealService.encoder.encode(array);
    let cipherText = sealService.encryptor.encrypt(plainText);

    let result = new EncryptedHealthDataSeal();
    result.cipherText = cipherText;

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
  cipherText: any;

  decrypt(sealService: SealService) {
    let decryptedPlainText = sealService.decryptor.decrypt(this.cipherText);
    let decodedArray = sealService.encoder.decode(decryptedPlainText);

    let result = new HealthData();
    result.cholesterol = decodedArray[0];
    result.bloodPressure = decodedArray[1];

    return result;
  }

  save() {
    return this.cipherText.save();
  }

  static load(data: string, sealService: SealService) {
    let cipherText = sealService.createCipherText();
    cipherText.load(sealService.context, data);

    let hpData = new EncryptedHealthDataSeal();
    hpData.cipherText = cipherText;

    return hpData;
  }
}
