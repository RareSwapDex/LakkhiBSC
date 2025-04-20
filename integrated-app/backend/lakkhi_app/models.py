from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from ckeditor.fields import RichTextField
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.validators import FileExtensionValidator
from django.db.models import JSONField
import datetime as dt
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.text import slugify


class UserManager(BaseUserManager):
    def create_user(
        self,
        email,
        username,
        bio,
        password,
        first_name=None,
        last_name=None,
        profile_picture=None,
        phone=None,
        wallet_address=None,
        total_contributions=0,
        is_active=True,
    ):
        if not email:
            raise ValueError("Users must have an email address")

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            first_name=first_name,
            last_name=last_name,
            profile_picture=profile_picture,
            bio=bio,
            phone=phone,
            wallet_address=wallet_address,
            total_contributions=total_contributions,
            is_active=is_active,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        email,
        password,
        username,
        wallet_address="adminwalletaddress",
    ):
        user = self.create_user(
            email=self.normalize_email(email),
            password=password,
            username=username,
            wallet_address=wallet_address,
            bio=""
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


def get_users_files_directory(instance, filename):
    if type(instance) is User:
        return f"users/{instance.username}/{filename}"


class LowerCaseCharField(models.CharField):
    def get_prep_value(self, value):
        return str(value).lower()


class User(AbstractUser):
    """
    Custom user model
    """
    username = models.CharField(max_length=20, unique=True, null=False, blank=False)
    email = LowerCaseCharField(max_length=254, unique=True, null=False, blank=False)
    password = models.CharField(max_length=254, null=False, blank=False)
    first_name = models.CharField(null=True, blank=True, max_length=50)
    last_name = models.CharField(null=True, blank=True, max_length=50)
    profile_picture = models.ImageField(
        blank=True,
        null=True,
        upload_to=get_users_files_directory,
    )
    bio = models.TextField(max_length=10000, null=True, blank=True, default="")
    phone = PhoneNumberField(null=True, blank=True)
    wallet_address = models.CharField(max_length=255, blank=True, null=True)
    creation_datetime = models.DateTimeField(auto_now_add=True)
    total_contributions = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    password_reset_token = models.CharField(null=True, blank=True, max_length=254)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin


def get_category_files_directory(instance, filename):
    return f"categories/{instance.name}/{filename}"


class Category(models.Model):
    """
    Project category model
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"


class Subcategory(models.Model):
    name = models.CharField(max_length=254, null=False, blank=False, unique=True)
    category = models.ForeignKey(
        Category, null=False, blank=False, on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name


class Type(models.Model):
    name = models.CharField(max_length=245, null=False, blank=False, unique=True)

    def __str__(self):
        return self.name


class Country(models.Model):
    # All countries
    iso = models.CharField(max_length=2, null=True)
    name = models.CharField(max_length=254, null=True)
    nicename = models.CharField(max_length=254, null=True)
    iso3 = models.CharField(max_length=3, null=True)
    numcode = models.IntegerField(null=True)
    phonecode = models.IntegerField(null=True)

    def __str__(self):
        return self.name


class EligibleCountry(models.Model):
    # Countries which can crowdfund with us
    iso = models.CharField(max_length=2, null=True)
    name = models.CharField(max_length=254, null=True)
    nicename = models.CharField(max_length=254, null=True)
    iso3 = models.CharField(max_length=3, null=True)
    numcode = models.IntegerField(null=True)
    phonecode = models.IntegerField(null=True)

    def __str__(self):
        return self.name


def get_project_files_directory(instance, filename):
    if type(instance) is Project:
        return f"projects/{instance.id}/{instance.title}/{filename}"
    elif type(instance) is ProjectFile:
        return f"projects/{instance.owner.id}/{instance.owner.title}/{filename}"


class Project(models.Model):
    """
    Project model for caching on-chain campaign data
    """
    # Basic info
    title = models.CharField(max_length=200)
    description = models.TextField()
    wallet_address = models.CharField(max_length=254)  # Campaign owner wallet
    token_address = models.CharField(max_length=254)  # Token contract address
    blockchain_chain = models.CharField(max_length=50, default='BSC')
    
    # Contract info
    contract_address = models.CharField(max_length=254, null=True, blank=True)
    transaction_hash = models.CharField(max_length=254, null=True, blank=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    
    # Funding details
    fund_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    raised_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='USD')
    
    # Timestamps
    creation_datetime = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    
    # Status and metrics
    status = models.CharField(max_length=20, default='draft')
    number_of_donators = models.IntegerField(default=0)

    @property
    def slug(self):
        return slugify(self.title)

    @property
    def fund_percentage(self):
        if self.fund_amount == 0:
            return 0
        return (self.raised_amount / self.fund_amount) * 100
        
    @property
    def contract_url(self):
        """Generate a contract URL based on the blockchain chain and contract address"""
        if not self.contract_address:
            return None
            
        if self.blockchain_chain == 'BSC':
            return f"https://bscscan.com/address/{self.contract_address}"
        elif self.blockchain_chain == 'Ethereum':
            return f"https://etherscan.io/address/{self.contract_address}"
        elif self.blockchain_chain == 'Solana':
            return f"https://explorer.solana.com/address/{self.contract_address}"
        elif self.blockchain_chain == 'Base':
            return f"https://basescan.org/address/{self.contract_address}"
        return None

    def __str__(self):
        return self.title


class TokenPrice(models.Model):
    """
    Cache for token prices
    """
    price = models.FloatField(null=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"${self.price} ({self.last_updated})"


class ProjectFile(models.Model):
    owner = models.ForeignKey(Project, null=True, blank=False, on_delete=models.CASCADE)
    file = models.FileField(
        blank=False,
        null=True,
        upload_to=get_project_files_directory,
    )
    file_type = models.CharField(max_length=254, null=True, blank=True)
    file_name = models.CharField(max_length=254, null=True, blank=True)

    def __str__(self):
        return f"{self.owner.title} - {self.file_name}" if self.owner else str(self.id)


class RSVP(models.Model):
    owner = models.ForeignKey(User, null=True, blank=False, on_delete=models.SET_NULL)
    title = models.CharField(max_length=254, null=True, blank=False, unique=True)
    thumbnail = models.ImageField(
        blank=False,
        null=True,
        default="help.jpg",
        upload_to=get_project_files_directory,
    )
    info = models.TextField(max_length=1000, null=True, blank=False)
    creation_datetime = models.DateTimeField(null=True, auto_now_add=True)
    event_date = models.DateTimeField(null=True, blank=False)
    approved = models.BooleanField(default=True)
    subscribers = models.ManyToManyField(User, related_name="rsvp_subscribed", blank=True)

    def __str__(self):
        return self.title


class RSVPSubscriber(models.Model):
    name = models.CharField(max_length=254, null=True, blank=True)
    email = LowerCaseCharField(max_length=254, unique=True, null=False, blank=False)

    def __str__(self):
        return self.email


class Campaign(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('funded', 'Funded'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    contract_owner = models.CharField(max_length=42, blank=True, null=True, help_text="Wallet address of the contract owner who can manage funds and releases")
    title = models.CharField(max_length=200)
    description = models.TextField()
    story = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='campaign_images/', null=True, blank=True)
    video_url = models.URLField(max_length=255, blank=True, null=True)
    fund_amount = models.DecimalField(max_digits=18, decimal_places=8)
    currency = models.CharField(max_length=10, default='USD')
    token_address = models.CharField(max_length=42, blank=True, null=True)
    token_name = models.CharField(max_length=50, blank=True, null=True)
    token_symbol = models.CharField(max_length=10, blank=True, null=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(blank=True, null=True)
    contract_address = models.CharField(max_length=42, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add blockchain field for multi-chain support
    blockchain = models.CharField(max_length=20, default='BSC', choices=[
        ('Ethereum', 'Ethereum'),
        ('BSC', 'BSC'),
        ('Base', 'Base')
    ], blank=True, null=True)  # The blockchain this campaign is deployed on
    
    # SEO and metadata
    keywords = models.CharField(max_length=254, null=True, blank=True)
    
    # Success criteria
    minimum_fund_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    
    # Social links
    website = models.URLField(max_length=255, null=True, blank=True)
    twitter = models.CharField(max_length=50, null=True, blank=True)
    telegram = models.CharField(max_length=50, null=True, blank=True)
    discord = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.title

    @property
    def total_raised(self):
        return sum(contribution.amount for contribution in self.contributions.all())
    
    @property
    def total_contributors(self):
        return self.contributions.values('user').distinct().count()
    
    @property
    def is_funded(self):
        return self.total_raised >= self.fund_amount
    
    @property
    def progress_percentage(self):
        if self.fund_amount <= 0:
            return 0
        return min(100, int((self.total_raised / self.fund_amount) * 100))
        
    @property
    def contract_url(self):
        if not self.contract_address:
            return None
            
        chain_to_explorer = {
            'BSC': 'https://bscscan.com/address/',
            'Ethereum': 'https://etherscan.io/address/',
            'Solana': 'https://solscan.io/account/',
            'Base': 'https://basescan.org/address/',
        }
        
        explorer_base = chain_to_explorer.get(self.blockchain, 'https://bscscan.com/address/')
        return f"{explorer_base}{self.contract_address}"


class Release(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='releases')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateTimeField(auto_now_add=True)
    release_date = models.DateTimeField(blank=True, null=True)
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)

    def __str__(self):
        return f"{self.campaign.title} - {self.title} ({self.status})"


class Milestone(models.Model):
    """
    Milestone model for tracking campaign progress
    """
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField()
    target_amount = models.DecimalField(max_digits=18, decimal_places=8)
    current_amount = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    due_date = models.DateTimeField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.campaign.title} - {self.title}"
    
    @property
    def progress_percentage(self):
        if self.target_amount <= 0:
            return 0
        return min(100, int((self.current_amount / self.target_amount) * 100))


class Update(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='campaign_updates/', null=True, blank=True)
    attachment = models.FileField(upload_to='campaign_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.campaign.title} - {self.title}"


class Comment(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    reported = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.campaign.title}" 


class Contribution(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='contributions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    currency = models.CharField(max_length=10, default='USD')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_anonymous = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.amount} {self.currency} to {self.campaign.title}"


class PaymentSession(models.Model):
    """
    Manages payment processing sessions
    """
    contribution = models.OneToOneField(Contribution, on_delete=models.CASCADE, related_name="payment_session")
    session_id = models.CharField(max_length=100, unique=True)
    payment_method = models.CharField(max_length=50, default="card")
    
    # Session data
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    # Callback URLs
    success_url = models.URLField(max_length=500)
    cancel_url = models.URLField(max_length=500)

    def __str__(self):
        return f"Payment session {self.session_id} for {self.contribution}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at 