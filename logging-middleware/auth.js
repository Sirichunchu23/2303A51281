const axios = require("axios");

const data = {
  email: "2303a51281@sru.edu.in",
  name: "chunchu siri",
  rollNo: "2303a51281",
  accessCode: "bDreAq",
  clientID: "d5d42c1f-d63b-4024-8dd6-764baa81c985",
  clientSecret: "zXsXkgTdgYtYHjjZ"
};

axios.post(
  "http://4.224.186.213/evaluation-service/auth",
  data
)
.then(res => {
  console.log(res.data);
})
.catch(err => {
  console.log(err.response?.data || err.message);
});