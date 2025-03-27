/**
 * Format a USD amount to 2 decimal places with comma separators
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted amount
 */
export const formatUSD = (amount, currency = '$') => {
  if (!amount && amount !== 0) return 'N/A';
  
  const numAmount = parseFloat(amount);
  const formatted = numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${currency}${formatted}`;
};

/**
 * Format a token amount to 6 decimal places with comma separators
 * @param {number|string} amount - Amount to format
 * @param {string} symbol - Token symbol
 * @returns {string} Formatted amount
 */
export const formatToken = (amount, symbol = '') => {
  if (!amount && amount !== 0) return 'N/A';
  
  const numAmount = parseFloat(amount);
  const formatted = numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  });
  
  return symbol ? `${formatted} ${symbol}` : formatted;
};

/**
 * Convert USD amount to token amount
 * @param {number|string} usdAmount - USD amount
 * @param {number|string} tokenPrice - Token price in USD
 * @param {string} symbol - Token symbol
 * @returns {string} Formatted token amount
 */
export const usdToToken = (usdAmount, tokenPrice, symbol = '') => {
  if (!usdAmount || !tokenPrice) return 'N/A';
  
  const amount = parseFloat(usdAmount) / parseFloat(tokenPrice);
  return formatToken(amount, symbol);
};

/**
 * Convert token amount to USD amount
 * @param {number|string} tokenAmount - Token amount
 * @param {number|string} tokenPrice - Token price in USD
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted USD amount
 */
export const tokenToUSD = (tokenAmount, tokenPrice, currency = '$') => {
  if (!tokenAmount || !tokenPrice) return 'N/A';
  
  const amount = parseFloat(tokenAmount) * parseFloat(tokenPrice);
  return formatUSD(amount, currency);
};

/**
 * Format a date string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

/**
 * Format a percentage
 * @param {number|string} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return 'N/A';
  
  const numValue = parseFloat(value);
  return `${numValue.toFixed(decimals)}%`;
};

export default {
  formatUSD,
  formatToken,
  usdToToken,
  tokenToUSD,
  formatDate,
  formatPercentage
}; 