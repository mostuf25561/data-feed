const fs = require("fs");
const path = require("path");

module.exports = {
  getFeedData: async function (url, login_url, username, password, token) {
    return new Promise(async (resolve, reject) => {
      //read json
      const data = fs.readFileSync(
        path.join(__dirname, "../__tests__/fixtures/weather.json"),
        "utf8"
      );
      const feedData = JSON.parse(data);
      //  console.log(feedData);
      try {
        // const results = await this.login();
        // const feed = require("../fixtures/weather.json");
        return resolve(feedData);
        url = "file:../fixtures/weather.json";
        axios(url, (error, response, body) => {
          if (error) {
            reject(error);
          }
          resolve(body);
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  login: async (user, password, token, login_url) => {
    //dummy login
    return Promise.resolve({ headers: { authorization: "token" } });
  },
};

//      await axios.post(login_url, {

//     if (login_url) {
//       if (token) {
//         return await axios.post(login_url, {
//           token: token,
//         });
//       } else if (user && password) {
//         return await axios.post(login_url, {
//           user: user,
//           password: password,
//         });
//       }
//       else {
//        return Promise.reject("No credentials provided");

//         }}
// //end}
// //end}
