import * as p from "paillier-bigint";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import { PaillierService } from "../services/paillierService";

export interface KeyPair<PUBLIC, PRIVATE> {
  publicKey: PUBLIC;
  privateKey: PRIVATE;
}

export class Config {
  zmqPort: number;

  paillierKeys: KeyPair<p.PublicKey, p.PrivateKey>;

  static async load() {
    let config = new Config();
    let pService = new PaillierService();

    let src = await fs.readFile("./secret/secret.env", "utf8");
    let env = dotenv.parse(src);

    let paillierPublicKey = pService.decodePublicKey(env["PAILLIER_PUBLIC_KEY"]);
    let paillierPrivateKey = pService.decodePrivateKey(env["PAILLIER_PRIVATE_KEY"], paillierPublicKey);

    config.zmqPort = parseInt(env["ZEROMQ_PORT"]);

    config.paillierKeys = {
      publicKey: paillierPublicKey,
      privateKey: paillierPrivateKey,
    };

    return config;
  }
}
