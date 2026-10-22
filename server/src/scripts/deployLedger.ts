import fs from "fs";
import path from "path";

import {
  fileURLToPath,
} from "url";

import solc from "solc";

import {
  ContractFactory,
  JsonRpcProvider,
} from "ethers";

// ======================================================
// PATH SETUP
// ======================================================

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const contractPath =
  path.resolve(
    __dirname,
    "../blockchain/MedicalRecordLedger.sol"
  );

// ======================================================
// COMPILE CONTRACT
// ======================================================

const compileContract =
  () => {
    const source =
      fs.readFileSync(
        contractPath,
        "utf8"
      );

    const input = {
      language:
        "Solidity",

      sources: {
        "MedicalRecordLedger.sol": {
          content:
            source,
        },
      },

      settings: {
        // ==================================================
        // IMPORTANT FIX
        //
        // Ganache currently runs:
        // Hardfork: shanghai
        //
        // Force Solidity compiler to generate
        // Shanghai-compatible bytecode.
        // ==================================================

        evmVersion:
          "shanghai",

        optimizer: {
          enabled:
            true,

          runs:
            200,
        },

        outputSelection: {
          "*": {
            "*": [
              "abi",
              "evm.bytecode.object",
            ],
          },
        },
      },
    };

    const output =
      JSON.parse(
        solc.compile(
          JSON.stringify(
            input
          )
        )
      );

    // ==================================================
    // PRINT COMPILER ERRORS
    // ==================================================

    if (
      output.errors
    ) {
      for (
        const error of
          output.errors
      ) {
        console.log(
          error.formattedMessage
        );
      }

      const fatalErrors =
        output.errors.filter(
          (
            error: any
          ) =>
            error.severity ===
            "error"
        );

      if (
        fatalErrors.length >
        0
      ) {
        throw new Error(
          "Solidity compilation failed."
        );
      }
    }

    const contract =
      output.contracts[
        "MedicalRecordLedger.sol"
      ][
        "MedicalRecordLedger"
      ];

    const abi =
      contract.abi;

    const bytecode =
      `0x${contract.evm.bytecode.object}`;

    if (
      !bytecode ||
      bytecode ===
        "0x"
    ) {
      throw new Error(
        "Contract bytecode was not generated."
      );
    }

    return {
      abi,
      bytecode,
    };
  };

// ======================================================
// DEPLOY
// ======================================================

const deploy =
  async () => {
    try {
      console.log(
        "=========================================="
      );

      console.log(
        "Compiling MedicalRecordLedger..."
      );

      console.log(
        "EVM Target: shanghai"
      );

      const {
        abi,
        bytecode,
      } =
        compileContract();

      const rpcUrl =
        process.env.BLOCKCHAIN_RPC_URL ||
        "http://127.0.0.1:7545";

      console.log(
        "Connecting to blockchain..."
      );

      console.log(
        "RPC:",
        rpcUrl
      );

      const provider =
        new JsonRpcProvider(
          rpcUrl
        );

      const network =
        await provider.getNetwork();

      console.log(
        "Chain ID:",
        Number(
          network.chainId
        )
      );

      const signer =
        await provider.getSigner(
          0
        );

      const signerAddress =
        await signer.getAddress();

      console.log(
        "Deploying from:",
        signerAddress
      );

      const balance =
        await provider.getBalance(
          signerAddress
        );

      console.log(
        "Signer balance:",
        balance.toString()
      );

      console.log(
        "Deploying MedicalRecordLedger..."
      );

      const factory =
        new ContractFactory(
          abi,
          bytecode,
          signer
        );

      const contract =
        await factory.deploy();

      console.log(
        "Deployment transaction:",
        contract.deploymentTransaction()
          ?.hash
      );

      await contract.waitForDeployment();

      const contractAddress =
        await contract.getAddress();

      console.log(
        "=========================================="
      );

      console.log(
        "MEDICAL RECORD LEDGER DEPLOYED"
      );

      console.log(
        "Contract Address:",
        contractAddress
      );

      console.log(
        "=========================================="
      );

      console.log(
        "Add this to your .env:"
      );

      console.log(
        `MEDICAL_LEDGER_ADDRESS=${contractAddress}`
      );
    } catch (error) {
      console.error(
        "LEDGER DEPLOY ERROR:",
        error
      );

      process.exitCode =
        1;
    }
  };

deploy();