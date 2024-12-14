import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import { PaillierService } from "./services/paillierService";

async function main() {
  let env = await fs.readFile("./secret/secret.env", "utf8");
  let config = dotenv.parse(env);

  let pService = new PaillierService();

  let publicKey = pService.decodePublicKey(config["PAILLIER_PUBLIC_KEY"]);
  let privateKey = pService.decodePrivateKey(config["PAILLIER_PRIVATE_KEY"], publicKey);
}

main();
