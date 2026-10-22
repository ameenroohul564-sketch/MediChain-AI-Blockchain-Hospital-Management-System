import {
  Contract,
  JsonRpcProvider,
  ZeroHash,
} from "ethers";

// ======================================================
// CONTRACT ABI
// ======================================================

const LEDGER_ABI = [
  "function addRecordHash(string recordId, bytes32 recordHash)",
  "function getLatestRecordHash(string recordId) view returns (bytes32 recordHash, uint256 timestamp, address storedBy, uint256 versionCount)",
  "function getRecordVersionCount(string recordId) view returns (uint256)",
  "function getRecordVersion(string recordId, uint256 index) view returns (bytes32 recordHash, uint256 timestamp, address storedBy)",
];

// ======================================================
// TYPES
// ======================================================

export interface BlockchainStoreResult {
  transactionHash: string;
  blockNumber: number | null;
}

export interface BlockchainHashResult {
  recordHash: string;
  timestamp: number;
  storedBy: string;
  versionCount: number;
}

export interface BlockchainVersion {
  version: number;
  recordHash: string;
  timestamp: number;
  storedBy: string;
}

// ======================================================
// ENV HELPERS
// ======================================================

const getRpcUrl = () => {
  const rpcUrl =
    process.env.BLOCKCHAIN_RPC_URL;

  if (!rpcUrl) {
    throw new Error(
      "BLOCKCHAIN_RPC_URL is missing in .env"
    );
  }

  return rpcUrl;
};

const getContractAddress =
  () => {
    const address =
      process.env.MEDICAL_LEDGER_ADDRESS;

    if (!address) {
      throw new Error(
        "MEDICAL_LEDGER_ADDRESS is missing in .env"
      );
    }

    return address;
  };

// ======================================================
// PROVIDER
// ======================================================

const getProvider = () => {
  return new JsonRpcProvider(
    getRpcUrl()
  );
};

// ======================================================
// CHECK CONTRACT EXISTS
// ======================================================

const verifyContractExists =
  async () => {
    const provider =
      getProvider();

    const address =
      getContractAddress();

    const code =
      await provider.getCode(
        address
      );

    if (
      !code ||
      code === "0x"
    ) {
      throw new Error(
        `No smart contract found at ${address}`
      );
    }

    return {
      provider,
      address,
    };
  };

// ======================================================
// READ CONTRACT
// ======================================================

const getReadContract =
  async () => {
    const {
      provider,
      address,
    } =
      await verifyContractExists();

    return new Contract(
      address,
      LEDGER_ABI,
      provider
    );
  };

// ======================================================
// WRITE CONTRACT
// ======================================================

const getWriteContract =
  async () => {
    const {
      provider,
      address,
    } =
      await verifyContractExists();

    const signer =
      await provider.getSigner(
        0
      );

    const signerAddress =
      await signer.getAddress();

    const balance =
      await provider.getBalance(
        signerAddress
      );

    console.log(
      "BLOCKCHAIN RPC:",
      getRpcUrl()
    );

    console.log(
      "LEDGER ADDRESS:",
      address
    );

    console.log(
      "BLOCKCHAIN SIGNER:",
      signerAddress
    );

    console.log(
      "SIGNER BALANCE:",
      balance.toString()
    );

    return new Contract(
      address,
      LEDGER_ABI,
      signer
    );
  };

// ======================================================
// NORMALIZE HASH
// ======================================================

const normalizeHash = (
  hash: string
): string => {
  const cleanHash =
    hash.startsWith("0x")
      ? hash.slice(2)
      : hash;

  if (
    !/^[a-fA-F0-9]{64}$/.test(
      cleanHash
    )
  ) {
    throw new Error(
      "Invalid SHA-256 hash. Expected exactly 64 hexadecimal characters."
    );
  }

  return `0x${cleanHash.toLowerCase()}`;
};

// ======================================================
// STORE HASH
// ======================================================

export const storeRecordHashOnBlockchain =
  async (
    recordId: string,
    hash: string
  ): Promise<BlockchainStoreResult> => {
    try {
      if (
        !recordId ||
        !recordId.trim()
      ) {
        throw new Error(
          "Record ID is required."
        );
      }

      const normalizedHash =
        normalizeHash(hash);

      console.log(
        "=========================================="
      );

      console.log(
        "BLOCKCHAIN STORE START"
      );

      console.log(
        "Record ID:",
        recordId
      );

      console.log(
        "Record Hash:",
        normalizedHash
      );

      const contract =
        await getWriteContract();

      console.log(
        "Sending blockchain transaction..."
      );

      const tx =
        await contract.addRecordHash(
          recordId,
          normalizedHash
        );

      console.log(
        "Transaction Hash:",
        tx.hash
      );

      const receipt =
        await tx.wait();

      if (!receipt) {
        throw new Error(
          "Blockchain transaction receipt was not returned."
        );
      }

      console.log(
        "BLOCKCHAIN STORE SUCCESS"
      );

      console.log(
        "Block Number:",
        receipt.blockNumber
      );

      console.log(
        "=========================================="
      );

      return {
        transactionHash:
          tx.hash,

        blockNumber:
          Number(
            receipt.blockNumber
          ),
      };
    } catch (error) {
      console.error(
        "=========================================="
      );

      console.error(
        "BLOCKCHAIN STORE FAILED"
      );

      console.error(
        error
      );

      console.error(
        "=========================================="
      );

      throw error;
    }
  };

// ======================================================
// GET LATEST HASH
// ======================================================

export const getLatestRecordHashFromBlockchain =
  async (
    recordId: string
  ): Promise<BlockchainHashResult | null> => {
    try {
      if (
        !recordId ||
        !recordId.trim()
      ) {
        throw new Error(
          "Record ID is required."
        );
      }

      const contract =
        await getReadContract();

      const result =
        await contract.getLatestRecordHash(
          recordId
        );

      const recordHash =
        String(
          result[0]
        );

      const timestamp =
        Number(
          result[1]
        );

      const storedBy =
        String(
          result[2]
        );

      const versionCount =
        Number(
          result[3]
        );

      if (
        versionCount === 0 ||
        recordHash ===
          ZeroHash
      ) {
        return null;
      }

      return {
        recordHash:
          recordHash.toLowerCase(),

        timestamp,

        storedBy,

        versionCount,
      };
    } catch (error) {
      console.error(
        "BLOCKCHAIN READ ERROR:",
        error
      );

      throw error;
    }
  };

// ======================================================
// VERIFY HASH
// ======================================================

export const verifyRecordHashOnBlockchain =
  async (
    recordId: string,
    currentHash: string
  ) => {
    const blockchainRecord =
      await getLatestRecordHashFromBlockchain(
        recordId
      );

    const normalizedCurrentHash =
      normalizeHash(
        currentHash
      );

    if (
      !blockchainRecord
    ) {
      return {
        verified: false,

        reason:
          "No blockchain hash exists for this medical record.",

        blockchainHash:
          null,

        currentHash:
          normalizedCurrentHash,

        timestamp:
          undefined,

        storedBy:
          undefined,

        versionCount:
          0,
      };
    }

    const verified =
      blockchainRecord.recordHash ===
      normalizedCurrentHash;

    return {
      verified,

      reason: verified
        ? "Medical record integrity verified successfully."
        : "Medical record hash does not match the blockchain ledger. The record may have been modified.",

      blockchainHash:
        blockchainRecord.recordHash,

      currentHash:
        normalizedCurrentHash,

      timestamp:
        blockchainRecord.timestamp,

      storedBy:
        blockchainRecord.storedBy,

      versionCount:
        blockchainRecord.versionCount,
    };
  };

// ======================================================
// BLOCKCHAIN HISTORY
// ======================================================

export const getRecordBlockchainHistory =
  async (
    recordId: string
  ): Promise<
    BlockchainVersion[]
  > => {
    try {
      if (
        !recordId ||
        !recordId.trim()
      ) {
        throw new Error(
          "Record ID is required."
        );
      }

      const contract =
        await getReadContract();

      const countValue =
        await contract.getRecordVersionCount(
          recordId
        );

      const count =
        Number(
          countValue
        );

      const history:
        BlockchainVersion[] =
          [];

      for (
        let index = 0;
        index < count;
        index++
      ) {
        const result =
          await contract.getRecordVersion(
            recordId,
            index
          );

        history.push({
          version:
            index + 1,

          recordHash:
            String(
              result[0]
            ).toLowerCase(),

          timestamp:
            Number(
              result[1]
            ),

          storedBy:
            String(
              result[2]
            ),
        });
      }

      return history;
    } catch (error) {
      console.error(
        "BLOCKCHAIN HISTORY ERROR:",
        error
      );

      throw error;
    }
  };

// ======================================================
// CONNECTION TEST
// ======================================================

export const testBlockchainConnection =
  async () => {
    const provider =
      getProvider();

    const address =
      getContractAddress();

    const network =
      await provider.getNetwork();

    const blockNumber =
      await provider.getBlockNumber();

    const code =
      await provider.getCode(
        address
      );

    return {
      connected: true,

      chainId:
        Number(
          network.chainId
        ),

      blockNumber,

      contractAddress:
        address,

      contractFound:
        code !== "0x",
    };
  };