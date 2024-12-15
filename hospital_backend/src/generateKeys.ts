import { PaillierService } from "./services/paillierService";
import { SealService } from "./services/sealService";
import * as fs from "fs/promises";

async function generatePaillierKeys() {
  let pService = new PaillierService();
  let pair = await pService.generateKeys();

  let publicKey = pService.encodePublicKey(pair.publicKey);
  let privateKey = pService.encodePrivateKey(pair.privateKey);

  let data = "";
  data += "PAILLIER_PUBLIC_KEY=" + publicKey + "\n";
  data += "PAILLIER_PRIVATE_KEY=" + privateKey + "\n";

  await fs.writeFile("keys_paillier.txt", data, "utf8");
}

async function generateSealKeys() {
  let sealService = new SealService();
  await sealService.init();
  await sealService.generateKeys();

  let publicKey = sealService.encodePublicKey();
  let privateKey = sealService.encodePrivateKey();

  let data = "";
  data += "SEAL_PUBLIC_KEY=" + publicKey + "\n";
  data += "SEAL_PRIVATE_KEY=" + privateKey + "\n";

  await fs.writeFile("keys_seal.txt", data, "utf8");
}

async function main() {
  await generatePaillierKeys();
  await generateSealKeys();
}

main();
