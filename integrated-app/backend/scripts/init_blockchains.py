#!/usr/bin/env python
"""
Initialize blockchain data in the database.
This script creates entries for the supported EVM-compatible blockchains.
"""

import os
import sys
import django

# Add the project directory to the path so we can import Django models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lakkhi_backend.settings")
django.setup()

from lakkhi_app.models import Blockchain

def initialize_blockchains():
    """
    Create or update the supported blockchain entries
    """
    print("Initializing supported blockchains...")
    
    # Define the supported blockchains
    chains = [
        {
            'name': 'ETH',
            'network_id': '1',
            'rpc_url': 'https://mainnet.infura.io/v3/your-infura-key',
            'explorer_url': 'https://etherscan.io',
            'gas_limit': 2000000,
            'is_enabled': True
        },
        {
            'name': 'BSC',
            'network_id': '56',
            'rpc_url': 'https://bsc-dataseed.binance.org',
            'explorer_url': 'https://bscscan.com',
            'gas_limit': 5000000,
            'is_enabled': True
        },
        {
            'name': 'BASE',
            'network_id': '8453',
            'rpc_url': 'https://mainnet.base.org',
            'explorer_url': 'https://basescan.org',
            'gas_limit': 1000000,
            'is_enabled': True
        }
    ]
    
    # Create or update blockchain entries
    for chain_data in chains:
        blockchain, created = Blockchain.objects.update_or_create(
            name=chain_data['name'],
            defaults={
                'network_id': chain_data['network_id'],
                'rpc_url': chain_data['rpc_url'],
                'explorer_url': chain_data['explorer_url'],
                'gas_limit': chain_data['gas_limit'],
                'is_enabled': chain_data['is_enabled']
            }
        )
        
        if created:
            print(f"Created blockchain: {blockchain.get_name_display()}")
        else:
            print(f"Updated blockchain: {blockchain.get_name_display()}")
    
    print("Blockchain initialization complete!")

if __name__ == "__main__":
    initialize_blockchains() 