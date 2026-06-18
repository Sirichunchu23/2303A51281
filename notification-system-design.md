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


# Stage 2

## Persistent Storage Choice

I recommend using **PostgreSQL** as the persistent storage.

### Why PostgreSQL?
- Supports ACID transactions for reliable notification delivery
- Handles large datasets efficiently
- Strong indexing support for fast querying
- Supports partitioning and scaling
- Suitable for structured relational data such as students and notifications

---

## Database Schema

### Students Table

```sql
CREATE TABLE students (
    studentID INT PRIMARY KEY,
    studentName VARCHAR(100),
    email VARCHAR(100)
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
    notificationID UUID PRIMARY KEY,
    studentID INT,
    notificationType VARCHAR(20),
    message TEXT,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentID) REFERENCES students(studentID)
);
```

---

## Problems as Data Volume Increases

As notification count grows:

1. Slow query performance  
   - Fetching unread notifications becomes slower

2. Increased storage usage  
   - Millions of rows increase disk usage

3. Higher DB load  
   - Frequent reads and writes overload database

4. Index maintenance overhead  
   - More data means indexes become larger

---

## Solutions

### 1. Indexing
Create indexes on frequently searched columns.

```sql
CREATE INDEX idx_student_read
ON notifications(studentID, isRead);
```

### 2. Partitioning
Split notifications table by month or year.

Example:
- notifications_2026_jan
- notifications_2026_feb

### 3. Archiving Old Data
Move old notifications to cold storage.

### 4. Caching
Use Redis to cache unread notification counts.

---

## Queries Based on REST APIs

### Create Notification

```sql
INSERT INTO notifications (
    notificationID,
    studentID,
    notificationType,
    message
)
VALUES (
    gen_random_uuid(),
    1042,
    'Placement',
    'Amazon hiring'
);
```

### Fetch All Notifications

```sql
SELECT * FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20;
```

### Fetch Unread Notifications

```sql
SELECT * FROM notifications
WHERE studentID = 1042
AND isRead = FALSE;
```

### Mark Notification as Read

```sql
UPDATE notifications
SET isRead = TRUE
WHERE notificationID = 'notification_uuid';
```

### Delete Notification

```sql
DELETE FROM notifications
WHERE notificationID = 'notification_uuid';
```

# Stage 3

## Query Analysis

Given Query:

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

---

## Is this Query Accurate?

Yes, the query correctly fetches all unread notifications for student 1042 and sorts them by creation time in ascending order.

However, although logically correct, it is inefficient for large datasets.

---

## Why is This Slow?

Database size:

- 50,000 students
- 5,000,000 notifications

Reasons for slow performance:

### 1. Full Table Scan
If no index exists, database scans millions of rows.

### 2. Sorting Cost
ORDER BY createdAt requires additional sorting.

### 3. Large Result Set
Fetching all unread notifications may return many rows.

### 4. SELECT *
Returns unnecessary columns, increasing I/O cost.

---

## What Would I Change?

### Add Composite Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

Benefits:
- Fast filtering by studentID
- Fast filtering by unread status
- Faster sorting using index order

### Optimize Query

```sql
SELECT notificationID, message, notificationType, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = FALSE
ORDER BY createdAt ASC;
```

---

## Likely Computation Cost

Without index:

- Time Complexity ≈ O(N log N)

Where N = total notifications

With composite index:

- Time Complexity ≈ O(log N + K)

Where:
- N = total rows
- K = matching rows

This is significantly faster.

---

## Should We Add Indexes on Every Column?

No.

Adding indexes on every column is inefficient.

Problems:

1. Increased storage usage  
2. Slower INSERT / UPDATE operations  
3. Index maintenance overhead  
4. Many indexes remain unused  

Best practice:
Only index frequently queried columns.

---

## Query to Find Students Who Received Placement Notification in Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

