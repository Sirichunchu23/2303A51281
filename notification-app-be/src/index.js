const fetchNotifications = require("./api");
const getTopNotifications = require("./priorityService");

async function main() {
  const notifications = await fetchNotifications();

  if (!notifications.length) {
    console.log("No notifications found");
    return;
  }

  const top10 = getTopNotifications(notifications);

  console.log("Top 10 Priority Notifications:\n");

  top10.forEach((notification, index) => {
    console.log(`${index + 1}.`);
    console.log(`ID: ${notification.ID}`);
    console.log(`Type: ${notification.Type}`);
    console.log(`Message: ${notification.Message}`);
    console.log(`Timestamp: ${notification.Timestamp}`);
    console.log("----------------------------");
  });
}

main();