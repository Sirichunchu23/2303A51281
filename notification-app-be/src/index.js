const express = require("express");
const fetchNotifications = require("./api");
const getTopNotifications = require("./priorityService");

const app = express();
const PORT = 5000;

// Allow frontend requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/notifications", async (req, res) => {
  try {
    const notifications = await fetchNotifications();

    if (!notifications.length) {
      return res.json({ notifications: [] });
    }

    const top10 = getTopNotifications(notifications);

    res.json({
      notifications: top10,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});