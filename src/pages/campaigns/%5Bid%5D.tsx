import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useCampaign, donateToCampaign } from '@/utils/anchor-client';
import { useWallet } from '@solana/wallet-adapter-react';
import Head from 'next/head';
import CardPaymentModal from '@/components/CardPaymentModal';

export default function CampaignDetail() {
  const router = useRouter();
  const { id } = router.query;
  const wallet = useWallet();
  const { campaign, loading, error } = useCampaign(id as string);
  const [donationAmount, setDonationAmount] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open and close handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openCardPayment = () => setIsCardPaymentOpen(true);
  const closeCardPayment = () => setIsCardPaymentOpen(false);

  if (loading) {
    return (
      <Layout>
        <div className="h-[500px] flex items-center justify-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Error loading campaign: {error.message}</span>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="mt-8 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Campaign not found</span>
        </div>
      </Layout>
    );
  }

  // Calculate funding percentage
  const fundingPercentage = campaign.currentAmount && campaign.targetAmount
    ? Math.min(100, Math.round((campaign.currentAmount.toNumber() / campaign.targetAmount.toNumber()) * 100))
    : 0;

  // Calculate days left
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
  const daysLeft = endDate
    ? Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Handle donation
  const handleDonate = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet to donate');
      return;
    }

    try {
      setIsSubmitting(true);
      const txId = await donateToCampaign(id as string, donationAmount);
      alert(`Donation successful! Transaction ID: ${txId}`);
      closeModal();
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Donation error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>{campaign.name} | Lakkhi Fundraising</title>
        <meta name="description" content={campaign.description} />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Campaign Header */}
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={campaign.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image'}
                alt={campaign.name}
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
              
              <div className="flex items-center mb-4">
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {campaign.category}
                </span>
                <span className="ml-2 text-sm text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {daysLeft} days left
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">
                    ${campaign.currentAmount.toNumber().toLocaleString()} raised
                  </span>
                  <span className="text-gray-600">
                    of ${campaign.targetAmount.toNumber().toLocaleString()} goal
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2 transition-all duration-500 ease-out"
                    style={{ width: `${fundingPercentage}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-sm text-gray-500">
                  {fundingPercentage}% funded
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  className={`px-4 py-2 rounded-lg text-white ${
                    wallet.connected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                  } flex-1`}
                  disabled={!wallet.connected}
                  onClick={openModal}
                >
                  Donate with Crypto
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1"
                  onClick={openCardPayment}
                >
                  Donate with Card
                </button>
              </div>
              
              {!wallet.connected && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm mb-4">
                  Connect your wallet to donate with cryptocurrency
                </div>
              )}
              
              {campaign.fundsReleased && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
                  Funds have been released to the campaign creator
                </div>
              )}
            </div>
          </div>
          
          {/* Campaign Body */}
          <div className="p-6 border-t">
            <h2 className="text-2xl font-bold mb-4">About this campaign</h2>
            <p className="whitespace-pre-line">{campaign.description}</p>
          </div>
        </div>
      </div>

      {/* Crypto Donation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Donate to {campaign.name}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Donation Amount (LAKKHI)</label>
                <div className="flex">
                  <input
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDonate}
                  disabled={isSubmitting || !wallet.connected}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isSubmitting || !wallet.connected ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Donate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Payment Modal */}
      {isCardPaymentOpen && (
        <CardPaymentModal
          isOpen={isCardPaymentOpen}
          onClose={closeCardPayment}
          campaign={campaign}
        />
      )}
    </Layout>
  );
} 