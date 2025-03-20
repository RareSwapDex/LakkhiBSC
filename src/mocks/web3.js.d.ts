declare module '@solana/web3.js' {
  export class PublicKey {
    constructor(value: string | Uint8Array | number[] | Buffer);
    toString(): string;
    value: string | Uint8Array | number[] | Buffer;
  }

  export class Connection {
    constructor(endpoint: string, commitment?: string);
    getBalance(publicKey: PublicKey): Promise<number>;
    endpoint: string;
    commitment: string;
  }

  export class Transaction {
    constructor();
    add(...instructions: TransactionInstruction[]): void;
    instructions: TransactionInstruction[];
  }

  export class TransactionInstruction {
    constructor(config: {
      keys: Array<{pubkey: PublicKey, isSigner: boolean, isWritable: boolean}>;
      programId: PublicKey;
      data: Buffer;
    });
    keys: Array<{pubkey: PublicKey, isSigner: boolean, isWritable: boolean}>;
    programId: PublicKey;
    data: Buffer;
  }

  export class Keypair {
    static generate(): Keypair;
    static fromSecretKey(secretKey: Uint8Array): Keypair;
    publicKey: PublicKey;
    secretKey: Uint8Array;
  }

  export function sendAndConfirmTransaction(
    connection: Connection, 
    transaction: Transaction, 
    signers: Keypair[]
  ): Promise<string>;

  export function clusterApiUrl(cluster?: string): string;

  export const SystemProgram: {
    programId: PublicKey;
    transfer(params: {
      fromPubkey: PublicKey;
      toPubkey: PublicKey;
      lamports: number;
    }): TransactionInstruction;
  };

  export const LAMPORTS_PER_SOL: number;
} 