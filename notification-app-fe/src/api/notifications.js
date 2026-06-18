export async function fetchNotifications({ page = 1, limit = 10, type = "All" } = {}) {
  const url = new URL("http://4.224.186.213/evaluation-service/notifications");

  url.searchParams.append("page", page);
  url.searchParams.append("limit", limit);

  if (type && type !== "All") {
    url.searchParams.append("notification_type", type);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzAzYTUxMjgxQHNydS5lZHUuaW4iLCJleHAiOjE3ODE3NzEwNDMsImlhdCI6MTc4MTc3MDE0MywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjViN2FiNzcwLTNlZmQtNDAyNy1hNDAwLTFhOTg4NDljNTY2YyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImNodW5jaHUgc2lyaSIsInN1YiI6ImQ1ZDQyYzFmLWQ2M2ItNDAyNC04ZGQ2LTc2NGJhYTgxYzk4NSJ9LCJlbWFpbCI6IjIzMDNhNTEyODFAc3J1LmVkdS5pbiIsIm5hbWUiOiJjaHVuY2h1IHNpcmkiLCJyb2xsTm8iOiIyMzAzYTUxMjgxIiwiYWNjZXNzQ29kZSI6ImJEcmVBcSIsImNsaWVudElEIjoiZDVkNDJjMWYtZDYzYi00MDI0LThkZDYtNzY0YmFhODFjOTg1IiwiY2xpZW50U2VjcmV0IjoielhzWGtnVGRnWXRZSGpqWiJ9.bAogeJt961mp1-poAkatC36LnTejohnrgJAiuljFy_Y"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}