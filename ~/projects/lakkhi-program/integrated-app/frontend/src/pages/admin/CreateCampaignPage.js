const deploySmartContract = async () => {
  try {
    if (!account) {
      setError('Wallet not connected. Please connect your wallet first.');
      return null;
    }
    
    // Inform user about the transaction
    setError('Please confirm the transaction in your wallet to deploy the campaign smart contract...');
    
    // Ensure we have access to window.ethereum (MetaMask)
    if (!window.ethereum) {
      setError('MetaMask not detected! Please install MetaMask and refresh the page.');
      return null;
    }
    
    // Initialize Web3 directly with window.ethereum
    const Web3 = require('web3');
    const web3 = new Web3(window.ethereum);
    
    // First, fetch the staking ABI from the backend
    const stakingABIResponse = await axios.get('/api/staking-abi/');
    const stakingABI = stakingABIResponse.data;
    
    // Get the compiled bytecode for the StakingContract
    const contractBytecodeResponse = await axios.get('/api/staking-bytecode/');
    const stakingBytecode = contractBytecodeResponse.data.bytecode;
    
    // Create a contract instance with just the ABI
    const stakingContract = new web3.eth.Contract(stakingABI);
    
    // Set up contract constructor parameters
    const name = formData.basics.projectTitle;
    const tokenAddress = formData.basics.tokenAddress; // This is the user-specified token address (like 0x9ec02756a559700d8d9e79ece56809f7bcc5dc27)
    const beneficiary = account; // Campaign creator is the beneficiary
    const targetAmountWei = web3.utils.toWei(formData.basics.projectFundAmount.toString(), 'ether');
    
    console.log('Deploying contract with params:', {
      name,
      tokenAddress,  // User-specified token address
      beneficiary,
      targetAmount: targetAmountWei
    });
    
    // Deploy contract with parameters - The token address is passed to the contract constructor
    const deployTransaction = stakingContract.deploy({
      data: stakingBytecode,
      arguments: [name, tokenAddress, beneficiary, targetAmountWei]
    });
    
    // Estimate gas
    const gas = await deployTransaction.estimateGas({
      from: account
    });
    
    // Trigger MetaMask transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        gas: web3.utils.toHex(Math.floor(gas * 1.2)), // Add 20% buffer
        data: deployTransaction.encodeABI()
      }]
    });
    
    console.log('Transaction submitted with hash:', txHash);
    
    // Wait for transaction receipt
    const waitForReceipt = async (hash, attempts = 30) => {
      if (attempts <= 0) throw new Error('Transaction receipt not found after maximum attempts');
      
      const receipt = await web3.eth.getTransactionReceipt(hash);
      if (receipt) return receipt;
      
      // Wait 2 seconds before trying again
      await new Promise(resolve => setTimeout(resolve, 2000));
      return waitForReceipt(hash, attempts - 1);
    };
    
    setError('Transaction submitted! Waiting for confirmation...');
    const receipt = await waitForReceipt(txHash);
    console.log('Transaction confirmed! Receipt:', receipt);
    
    // Get the deployed contract address
    const contractAddress = receipt.contractAddress;
    
    if (!contractAddress) {
      throw new Error('Contract address not found in receipt');
    }
    
    console.log('Contract deployed at address:', contractAddress);
    
    // Return contract data including the token address that was used
    return {
      contract_address: contractAddress,
      contract_abi: JSON.stringify(stakingABI),
      transaction_hash: txHash,
      block_number: receipt.blockNumber,
      chain: formData.basics.blockchainChain || 'BSC',
      token_address: tokenAddress  // Include the token address used for this contract
    };
    
  } catch (error) {
    console.error('Error deploying contract:', error);
    setError(`Contract deployment failed: ${error.message}`);
    return null;
  }
}; 