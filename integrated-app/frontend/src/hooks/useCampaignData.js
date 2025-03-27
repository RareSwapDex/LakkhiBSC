import { useState, useEffect } from 'react';
import axios from 'axios';

const useCampaignData = (campaignId) => {
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributions, setContributions] = useState([]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignResponse, contributionsResponse] = await Promise.all([
        axios.get(`/api/campaigns/${campaignId}/`),
        axios.get(`/api/campaigns/${campaignId}/contributions/`),
      ]);

      setCampaignData(campaignResponse.data);
      setContributions(contributionsResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaign data:', err);
      setError(err.response?.data?.message || 'Failed to fetch campaign data');
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignData = async (data) => {
    try {
      const response = await axios.patch(`/api/campaigns/${campaignId}/`, data);
      setCampaignData(response.data);
      return response.data;
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err.response?.data?.message || 'Failed to update campaign');
      throw err;
    }
  };

  const addContribution = async (contributionData) => {
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/contributions/`,
        contributionData
      );
      setContributions(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error adding contribution:', err);
      setError(err.response?.data?.message || 'Failed to add contribution');
      throw err;
    }
  };

  const updateMilestone = async (milestoneId, data) => {
    try {
      const response = await axios.patch(
        `/api/campaigns/${campaignId}/milestones/${milestoneId}/`,
        data
      );
      setCampaignData(prev => ({
        ...prev,
        milestones: prev.milestones.map(m =>
          m.id === milestoneId ? response.data : m
        ),
      }));
      return response.data;
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError(err.response?.data?.message || 'Failed to update milestone');
      throw err;
    }
  };

  const addMilestone = async (milestoneData) => {
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/milestones/`,
        milestoneData
      );
      setCampaignData(prev => ({
        ...prev,
        milestones: [...prev.milestones, response.data],
      }));
      return response.data;
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError(err.response?.data?.message || 'Failed to add milestone');
      throw err;
    }
  };

  const deleteMilestone = async (milestoneId) => {
    try {
      await axios.delete(`/api/campaigns/${campaignId}/milestones/${milestoneId}/`);
      setCampaignData(prev => ({
        ...prev,
        milestones: prev.milestones.filter(m => m.id !== milestoneId),
      }));
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError(err.response?.data?.message || 'Failed to delete milestone');
      throw err;
    }
  };

  const addUpdate = async (updateData) => {
    try {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/updates/`,
        updateData
      );
      setCampaignData(prev => ({
        ...prev,
        updates: [...prev.updates, response.data],
      }));
      return response.data;
    } catch (err) {
      console.error('Error adding update:', err);
      setError(err.response?.data?.message || 'Failed to add update');
      throw err;
    }
  };

  const updateUpdate = async (updateId, data) => {
    try {
      const response = await axios.patch(
        `/api/campaigns/${campaignId}/updates/${updateId}/`,
        data
      );
      setCampaignData(prev => ({
        ...prev,
        updates: prev.updates.map(u =>
          u.id === updateId ? response.data : u
        ),
      }));
      return response.data;
    } catch (err) {
      console.error('Error updating update:', err);
      setError(err.response?.data?.message || 'Failed to update update');
      throw err;
    }
  };

  const deleteUpdate = async (updateId) => {
    try {
      await axios.delete(`/api/campaigns/${campaignId}/updates/${updateId}/`);
      setCampaignData(prev => ({
        ...prev,
        updates: prev.updates.filter(u => u.id !== updateId),
      }));
    } catch (err) {
      console.error('Error deleting update:', err);
      setError(err.response?.data?.message || 'Failed to delete update');
      throw err;
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  return {
    campaignData,
    contributions,
    loading,
    error,
    fetchCampaignData,
    updateCampaignData,
    addContribution,
    updateMilestone,
    addMilestone,
    deleteMilestone,
    addUpdate,
    updateUpdate,
    deleteUpdate,
  };
};

export default useCampaignData; 