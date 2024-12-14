import * as p from "paillier-bigint";

export class PaillierService {
  async generateKeys() {
    let pair = await p.generateRandomKeys(3072);
    return pair;
  }

  encodePublicKey(publicKey: p.PublicKey) {
    let data = {
      n: publicKey.n.toString(),
      g: publicKey.g.toString(),
    };

    return JSON.stringify(data);
  }

  decodePublicKey(publicKey: string) {
    let data = JSON.parse(publicKey);

    let n = BigInt(data["n"]);
    let g = BigInt(data["g"]);

    return new p.PublicKey(n, g);
  }

  encodePrivateKey(privateKey: p.PrivateKey) {
    let data = {
      lambda: privateKey.lambda.toString(),
      mu: privateKey.mu.toString(),
    };

    return JSON.stringify(data);
  }

  decodePrivateKey(privateKey: string, publicKey: p.PublicKey) {
    let data = JSON.parse(privateKey);

    let lambda = BigInt(data["lambda"]);
    let mu = BigInt(data["mu"]);

    return new p.PrivateKey(lambda, mu, publicKey);
  }
}
