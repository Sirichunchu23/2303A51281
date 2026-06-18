require("dotenv").config();
const axios = require("axios");

const TOKEN = process.env.ACCESS_TOKEN;

async function fetchNotifications() {
  try {
    const response = await axios.get(
      "http://4.224.186.213/evaluation-service/notifications",
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    return response.data.notifications;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return [];
  }
}

module.exports = fetchNotifications;