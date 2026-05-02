
/**
 * Simulated Celo Blockchain Service
 * Mimics real contract interactions with delay and technical metadata.
 */

export interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  status: 'confirmed' | 'failed';
  from: string;
  to: string;
}

export const CeloService = {
  // Generate a realistic transaction hash
  generateHash: () => '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),

  // Simulate a contract call
  async callContract(method: string, args: any[]): Promise<TransactionReceipt> {
    console.log(`[Celo] Calling ${method} with:`, args);
    
    // Simulate network latency
    const delay = 1500 + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    return {
      hash: this.generateHash(),
      blockNumber: Math.floor(18000000 + Math.random() * 100000),
      gasUsed: (21000 + Math.floor(Math.random() * 5000)).toString(),
      status: 'confirmed',
      from: '0x' + 'a'.repeat(40), // User wallet address
      to: '0x' + 'c'.repeat(40),    // Contract address
    };
  }
};
