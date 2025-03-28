# Generated by Django 5.1.7 on 2025-03-26 19:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lakkhi_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='block_number',
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='contract_address',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='transaction_hash',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
    ]
