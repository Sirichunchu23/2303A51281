export async function fetchNotifications() {
  const response = await fetch("http://localhost:5000/notifications");
  return await response.json();
}