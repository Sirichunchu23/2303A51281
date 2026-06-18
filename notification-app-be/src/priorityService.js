function getWeight(type) {
  switch (type) {
    case "Placement":
      return 3;
    case "Result":
      return 2;
    case "Event":
      return 1;
    default:
      return 0;
  }
}

function getTopNotifications(notifications) {
  const ranked = notifications.map((notification) => {
    const weight = getWeight(notification.Type);
    const timestamp = new Date(notification.Timestamp).getTime();

    const score = weight * 10000000000000 + timestamp;

    return {
      ...notification,
      score,
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked.slice(0, 10);
}

module.exports = getTopNotifications;