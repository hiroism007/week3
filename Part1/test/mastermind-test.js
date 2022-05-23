const chai = require("chai");
const buildPoseidon = require("circomlibjs").buildPoseidon;
const wasm_tester = require("circom_tester").wasm;

describe("SuperMastermind test", function () {
  this.timeout(100000000);
  let F;
  let poseidonHash;
  let poseidonHash6;

  beforeEach(async () => {
    const poseidon = await buildPoseidon();
    F = poseidon.F;
    poseidonHash = (items) => F.toObject(poseidon(items));
    poseidonHash6 = (a, b, c, d, e, f) => poseidonHash([a, b, c, d, e, f]);
  });

  it("Should check constrain of the circuit", async () => {
    const circuit = await wasm_tester(
      "contracts/circuits/MastermindVariation.circom"
    );
    await circuit.loadConstraints();

    const [pubGuessA, pubGuessB, pubGuessC, pubGuessD, pubGuessF] = [
      0, 1, 2, 3, 4,
    ].map((r) => String(r));

    const [privSolnA, privSolnB, privSolnC, privSolnD, privSolnF] = [
      6, 7, 2, 0, 1,
    ].map((r) => String(r));
    const privSalt = "10";

    const pubNumHit = "1";
    const pubNumBlow = "2";

    const pubSolnHash = poseidonHash6(
      privSalt,
      privSolnA,
      privSolnB,
      privSolnC,
      privSolnD,
      privSolnF
    );

    const INPUT = {
      pubGuessA,
      pubGuessB,
      pubGuessC,
      pubGuessD,
      pubGuessF,
      pubNumHit,
      pubNumBlow,
      pubSolnHash,
      privSalt,
      privSolnA,
      privSolnB,
      privSolnC,
      privSolnD,
      privSolnF,
    };

    // generate witness
    const witness = await circuit.calculateWitness(INPUT, true);

    // make sure that generated witness equals to expected result, { solnHashOut: pubSolnHash }
    await circuit.assertOut(witness, { solnHashOut: pubSolnHash });
    circuit.checkConstraints(witness);
  });
});
