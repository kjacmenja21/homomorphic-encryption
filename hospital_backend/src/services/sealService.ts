const SEAL = require("node-seal");
import { KeyPair } from "../models/config";

export class SealService {
  private seal: any;
  context: any;

  private publicKey: any;
  private secretKey: any;

  encoder: any;
  encryptor: any;
  decryptor: any;
  evaluator: any;

  async init() {
    let seal = await SEAL();
    this.seal = seal;

    let schemeType = seal.SchemeType.bfv;
    let securityLevel = seal.SecurityLevel.tc128;

    let polyModulusDegree = 4096;
    let bitSizes = [36, 36, 37];
    let bitSize = 20;

    let parms = seal.EncryptionParameters(schemeType);

    parms.setPolyModulusDegree(polyModulusDegree);
    parms.setCoeffModulus(seal.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes)));
    parms.setPlainModulus(seal.PlainModulus.Batching(polyModulusDegree, bitSize));

    let context = seal.Context(parms, true, securityLevel);
    this.context = context;

    if (!context.parametersSet()) {
      throw new Error("Could not set the parameters in the given context. Please try different encryption parameters.");
    }
  }

  initHelpers() {
    this.encoder = this.seal.BatchEncoder(this.context);
    this.encryptor = this.seal.Encryptor(this.context, this.publicKey);
    this.decryptor = this.seal.Decryptor(this.context, this.secretKey);
    this.evaluator = this.seal.Evaluator(this.context);
  }

  async generateKeys() {
    let keyGenerator = this.seal.KeyGenerator(this.context);

    let publicKey = keyGenerator.createPublicKey();
    let privateKey = keyGenerator.secretKey();

    let pair: KeyPair<any, any> = {
      publicKey: publicKey,
      privateKey: privateKey,
    };

    return pair;
  }

  encodePublicKey() {
    return this.publicKey.save();
  }

  encodePrivateKey() {
    return this.secretKey.save();
  }

  decodeKeys(publicKey: string, privateKey: string) {
    this.publicKey = this.seal.PublicKey();
    this.secretKey = this.seal.SecretKey();

    this.publicKey.load(this.context, publicKey);
    this.secretKey.load(this.context, privateKey);
  }

  createCipherText() {
    return this.seal.CipherText();
  }
}
