/**
 * TypeScript declarations for web3.js mock
 */

/**
 * Send and confirm a transaction
 * 
 * @param connection - Connection to use
 * @param transaction - Transaction to send
 * @param signers - The signers of the transaction
 * @returns The transaction signature
 */
export function sendAndConfirmTransaction(
  connection: any,
  transaction: any,
  signers: Array<any>
): Promise<string>;

declare module '@solana/web3.js' {
  export class PublicKey {
    constructor(value: string | Uint8Array | number[] | Buffer);
    toString(): string;
    toBase58(): string;
    value: string | Uint8Array | number[] | Buffer;
  }

  export class Connection {
    constructor(endpoint: string, commitment?: string);
    getBalance(publicKey: PublicKey): Promise<number>;
    getAccountInfo(publicKey: PublicKey): Promise<any>;
    getLatestBlockhash(): Promise<{ blockhash: string, lastValidBlockHeight: number }>;
    getMinimumBalanceForRentExemption(size: number): Promise<number>;
    sendRawTransaction(rawTransaction: Uint8Array): Promise<string>;
    endpoint: string;
    commitment: string;
  }

  export class Transaction {
    constructor();
    add(...instructions: TransactionInstruction[]): void;
    partialSign(keypair: Keypair): void;
    feePayer: PublicKey | null;
    recentBlockhash: string | null;
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
    static fromSeed(seed: Uint8Array): Keypair;
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
    createAccount(params: {
      fromPubkey: PublicKey;
      newAccountPubkey: PublicKey;
      space: number;
      lamports: number;
      programId: PublicKey;
    }): TransactionInstruction;
  };

  export type Commitment = 'processed' | 'confirmed' | 'finalized';
  export const LAMPORTS_PER_SOL: number;
} 