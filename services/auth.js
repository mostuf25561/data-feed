const fs = require("fs");
const path = require("path");
const credentialModel = require("../models/credential");
const _ = require("lodash");
module.exports = {
  getApiKey: async (url, credentials) => {
    //dummy function to get api key
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return Promise.resolve({ api_key: "1234567890" });
      });
    });
  },
  getFeedData: async function (feed) {
    const { url, root_notation, credential_id } = feed;
    let credentials;
    return new Promise(async (resolve, reject) => {
      // try {
      //   credentials = await credentialModel.query().findById(credential_id);
      //   console.log("credentials", credentials);
      // } catch (err) {
      //   console.log("no credentials found");
      // }
      // if (credentials) {
      //   try {
      //     const apiToken = await this.getApiKey(url, credentials);
      //     console.log("apiToken", apiToken);
      //   } catch (err) {
      //     console.log("no apiKey found");
      //   }
      // }
      //read local json
      try {
        const data = fs.readFileSync(
          path.join(__dirname, "../__tests__/fixtures/api_entries.json"),
          "utf8"
        );

        const feedData = JSON.parse(data);

        resolve(feedData);
      } catch (err) {
        reject(err);
      }
    });
  },

  login: async (user, password, token, login_url) => {
    //dummy login
    return Promise.resolve({ headers: { authorization: "token" } });
  },
};
