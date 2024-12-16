const SEAL = require("node-seal");

export class SealService {
  private seal: any;
  context: any;

  private publicKey: any;

  encoder: any;
  encryptor: any;
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
    this.evaluator = this.seal.Evaluator(this.context);
  }

  decodePublicKey(publicKey: string) {
    this.publicKey = this.seal.PublicKey();
    this.publicKey.load(this.context, publicKey);
  }

  createCipherText() {
    return this.seal.CipherText();
  }

  encodeNumber(a: number) {
    let array = Int32Array.from([a]);
    let plainText = this.encoder.encode(array);
    let cipherText = this.encryptor.encrypt(plainText);

    return cipherText;
  }
}
