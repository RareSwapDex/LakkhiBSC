/**
 * Mock implementation of @solana/web3.js
 */

// Utility function to create a buffer
function createBuffer(data) {
  return Buffer.from(data || []);
}

// Define clusterApiUrl function
const clusterApiUrl = (cluster) => `https://api.${cluster || 'devnet'}.solana.com`;

// PublicKey implementation
class PublicKey {
  constructor(value) {
    this.value = value;
  }
  
  toString() { return this.value.toString(); }
}

// Transaction implementation
class Transaction {
  constructor() {
    this.instructions = [];
  }
  
  add(...instructions) {
    this.instructions.push(...instructions);
  }
}

// TransactionInstruction implementation
class TransactionInstruction {
  constructor(config) {
    this.keys = config.keys || [];
    this.programId = config.programId;
    this.data = config.data;
  }
}

// Connection implementation
class Connection {
  constructor(endpoint, commitment) {
    this.endpoint = endpoint;
    this.commitment = commitment;
  }
  
  getBalance() {
    return Promise.resolve(0);
  }
}

// Keypair implementation
class Keypair {
  static generate() {
    return new Keypair();
  }
  
  static fromSecretKey(secretKey) {
    return new Keypair();
  }
  
  constructor() {
    this.publicKey = new PublicKey('mock-public-key');
    this.secretKey = new Uint8Array(32);
  }
}

// Message implementations
class Message {
  constructor() {}
  serialize() { return new Uint8Array(); }
  static from() { return new Message(); }
}

class VersionedMessage {
  constructor() {}
  static deserialize() { return new VersionedMessage(); }
}

class VersionedTransaction {
  constructor(message) {
    this.signatures = [];
    this.message = message || new VersionedMessage();
  }
  
  serialize() { return new Uint8Array(); }
  static deserialize() { return new VersionedTransaction(); }
}

// Constants
const SIGNATURE_LENGTH_IN_BYTES = 64;
const LAMPORTS_PER_SOL = 1000000000;

// System Program
const SystemProgram = {
  programId: new PublicKey('11111111111111111111111111111111'),
  transfer: (params) => {
    return new TransactionInstruction({
      keys: [
        { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
        { pubkey: params.toPubkey, isSigner: false, isWritable: true },
      ],
      programId: SystemProgram.programId,
      data: Buffer.from([2, 0, 0, 0, ...new Uint8Array(8)]), // Mock data
    });
  }
};

// Commitment enum
const Commitment = { 
  confirmed: 'confirmed', 
  finalized: 'finalized',
  processed: 'processed'
};

// Mock sendAndConfirmTransaction function
async function sendAndConfirmTransaction(connection, transaction, signers) {
  console.log('Mock sendAndConfirmTransaction called');
  return 'mock-transaction-signature';
}

// ES Module exports for TypeScript
export {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Connection,
  Keypair,
  Message,
  VersionedMessage,
  VersionedTransaction,
  SIGNATURE_LENGTH_IN_BYTES,
  LAMPORTS_PER_SOL,
  SystemProgram,
  clusterApiUrl,
  Commitment,
  sendAndConfirmTransaction,
};

// CommonJS exports for Node.js
module.exports = {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Connection,
  Keypair,
  Message,
  VersionedMessage,
  VersionedTransaction,
  SIGNATURE_LENGTH_IN_BYTES,
  LAMPORTS_PER_SOL,
  SystemProgram,
  clusterApiUrl,
  Commitment,
  sendAndConfirmTransaction,
};