const axios = require("axios");

const data = {
  email: "2303A51281@sru.edu.in",
  name: "Chunchu Siri",
  mobileNo: "9550544380",
  githubUsername: "Sirichunchu23",
  rollNo: "2303A51281",
  accessCode: "bDreAq"
};

axios.post(
  "http://4.224.186.213/evaluation-service/register",
  data
)
.then(res => {
  console.log(res.data);
})
.catch(err => {
  console.log(err.response?.data || err.message);
});