const SEAL = require("node-seal");

export class SealService {
  private seal: any;
  context: any;

  encoder: any;
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
    this.evaluator = this.seal.Evaluator(this.context);
  }

  createCipherText() {
    return this.seal.CipherText();
  }
}
