# Notification System Design
# Stage 1

## Core Actions Supported

1. Create notification
2. Fetch all notifications
3. Fetch unread notifications
4. Mark notification as read
5. Delete notification
6. Real-time push notification delivery

## REST API Design

### 1. Create Notification

POST /api/notifications

Headers:
```json
{
  "Content-Type": "application/json"
}
```

Request Body:
```json
{
  "studentId": 1042,
  "notificationType": "Placement",
  "message": "Amazon hiring for SDE role"
}
```

Response:
```json
{
  "notificationId": "uuid",
  "status": "created"
}
```

### 2. Get Notifications

GET /api/notifications?studentId=1042&page=1&limit=20

Response:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "Amazon hiring",
      "isRead": false,
      "createdAt": "2026-06-18T10:00:00Z"
    }
  ]
}
```

### 3. Get Unread Notifications

GET /api/notifications/unread?studentId=1042

Response:
```json
{
  "count": 5,
  "notifications": []
}
```

### 4. Mark as Read

PATCH /api/notifications/{id}/read

Response:
```json
{
  "status": "updated"
}
```

### 5. Delete Notification

DELETE /api/notifications/{id}

Response:
```json
{
  "status": "deleted"
}
```

## Real-Time Notification Mechanism

Use WebSockets for real-time notifications.

Workflow:
- Client connects via WebSocket
- Server stores active connections
- New notifications are pushed instantly
- If offline, notifications remain in database for later fetch