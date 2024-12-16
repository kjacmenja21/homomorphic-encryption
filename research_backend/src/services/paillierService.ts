import * as p from "paillier-bigint";

export class PaillierService {
  async generateKeys() {
    let pair = await p.generateRandomKeys(3072);
    return pair;
  }

  decodePublicKey(publicKeyJson: any) {
    let n = BigInt(publicKeyJson["n"]);
    let g = BigInt(publicKeyJson["g"]);

    return new p.PublicKey(n, g);
  }
}
