import { PaillierService } from "./services/paillierService";
import * as fs from "fs/promises";

async function generateKeys() {
  let pService = new PaillierService();
  let pair = await pService.generateKeys();

  let publicKey = pService.encodePublicKey(pair.publicKey);
  let privateKey = pService.encodePrivateKey(pair.privateKey);

  let data = "";
  data += "PAILLIER_PUBLIC_KEY=" + publicKey + "\n";
  data += "PAILLIER_PRIVATE_KEY=" + privateKey + "\n";

  await fs.writeFile("keys.txt", data, "utf8");
}

generateKeys();
