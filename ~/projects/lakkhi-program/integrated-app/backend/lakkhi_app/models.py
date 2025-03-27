class Project(models.Model):
    # Basic fields
    title = models.CharField(max_length=254)
    description = models.TextField(blank=True, null=True)
    wallet_address = models.CharField(max_length=254)
    token_address = models.CharField(max_length=254)
    fund_amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    deadline = models.DateTimeField(null=True, blank=True)
    blockchain_chain = models.CharField(max_length=20, default="BSC")
    
    # Blockchain details
    staking_address = models.CharField(max_length=254, null=True, blank=True)
    staking_abi = models.TextField(null=True, blank=True)
    transaction_hash = models.CharField(max_length=254, null=True, blank=True)
    block_number = models.IntegerField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, default="draft", choices=(
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ... rest of the model ... 

class Contribution(models.Model):
    """Model to track contributions to projects"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='contributions')
    contributor_email = models.EmailField(blank=True, null=True)
    contributor_wallet_address = models.CharField(max_length=254, blank=True, null=True)
    
    # USD amount
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    
    # Token amount and details
    token_amount = models.DecimalField(max_digits=30, decimal_places=18, blank=True, null=True)
    token_address = models.CharField(max_length=254, blank=True, null=True)
    
    # Transaction details
    transaction_hash = models.CharField(max_length=254, blank=True, null=True)
    transaction_datetime = models.DateTimeField(auto_now_add=True)
    
    # Optional incentive
    incentive = models.ForeignKey('Incentive', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.contributor_email or self.contributor_wallet_address} - {self.amount} USD ({self.token_amount} tokens)"


class Incentive(models.Model):
    """Model for project incentives/rewards"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='incentives')
    title = models.CharField(max_length=254)
    description = models.TextField()
    minimum_amount = models.DecimalField(max_digits=20, decimal_places=2)
    image = models.ImageField(upload_to='incentives/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.minimum_amount} USD" 