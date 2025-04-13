/**
 * Truncates an Ethereum address for display
 * @param {string} address - The full address to truncate
 * @param {number} startChars - Number of characters to show at the start (default: 6)
 * @param {number} endChars - Number of characters to show at the end (default: 4)
 * @returns {string} The truncated address
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formats a date as a string
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - The locale to use for formatting (default: 'en-US')
 * @returns {string} The formatted date string
 */
export const formatDate = (date, options = { year: 'numeric', month: 'long', day: 'numeric' }, locale = 'en-US') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Shortens a number to a more readable format (K, M, B)
 * @param {number} num - The number to format
 * @param {number} digits - Number of digits after decimal point (default: 1)
 * @returns {string} The shortened number
 */
export const shortenNumber = (num, digits = 1) => {
  if (num === null || num === undefined) return '';
  
  const units = ['', 'K', 'M', 'B', 'T'];
  let unitIndex = 0;
  let value = Math.abs(num);
  
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  
  // Handle negative numbers
  const sign = num < 0 ? '-' : '';
  return `${sign}${value.toFixed(digits)}${units[unitIndex]}`;
}; 