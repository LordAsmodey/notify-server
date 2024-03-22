import fetchData from 'node-fetch';

let cachedData = null;

export const CryptoModel = {
  fetchDataFromAPI: async () => {
    try {
      const response = await fetchData(process.env.CRYPTO_PRICE_URL || '');
      if (response.ok) {
        cachedData = await response.json();
      } else {
        console.error('ERROR:', response.status);
      }
    } catch (error) {
      console.error('REQUEST ERROR:', error);
    }
  },

  getCachedData:  () => {
    return cachedData;
  },
};
