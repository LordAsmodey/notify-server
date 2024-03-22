import {CryptoModel} from "../models/cryptoModel.js";

const cryptoService = {
  async fetchData() {
    return await CryptoModel.fetchDataFromAPI();
  },

  async updateData(data) {
    if (data) {
      await CryptoModel.updateUsers(data);
    }
  },

  fetchDataAndUpdate() {
    this.fetchData()
      .then(data => this.updateData(data))
      .catch(error => {
        console.error('Error:', error);
      });
  }
};

export default cryptoService;
