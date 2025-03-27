const donateToProject = async (contractAddress, tokenAddress, amount) => {
  if (!web3 || !account) {
    throw new Error('Wallet not connected');
  }
  
  try {
    // First approve the token spending
    const tokenABI = [
      {
        "inputs": [
          {"name": "spender", "type": "address"},
          {"name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"name": "account", "type": "address"}
        ],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    // Create token contract instance
    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    
    // Convert amount to wei
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');
    
    // Check balance
    const balance = await tokenContract.methods.balanceOf(account).call();
    if (BigInt(balance) < BigInt(amountWei)) {
      throw new Error(`Insufficient token balance. You need at least ${amount} tokens.`);
    }
    
    // Approve tokens for the staking contract
    const approvalTx = await tokenContract.methods.approve(contractAddress, amountWei).send({
      from: account
    });
    
    if (!approvalTx.status) {
      throw new Error('Token approval failed');
    }
    
    // Now stake tokens
    const campaignContract = new web3.eth.Contract(CAMPAIGN_ABI, contractAddress);
    
    // Call the stake function
    const stakeTx = await campaignContract.methods.stake(amountWei).send({
      from: account
    });
    
    return {
      success: true,
      txHash: stakeTx.transactionHash
    };
  } catch (error) {
    console.error('Error donating to project:', error);
    return {
      success: false,
      message: error.message || 'Failed to donate to project'
    };
  }
};

const contextValue = {
  provider,
  web3,
  account,
  chainId,
  isConnected,
  connectWallet,
  disconnectWallet,
  donateToProject,
}; 