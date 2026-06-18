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

# Stage 4

## Problem

Notifications are being fetched from the database on every page load for every student.

This causes:

- High database read load
- Increased response latency
- Poor user experience
- Server resource exhaustion during peak usage

---

## Suggested Solutions

### 1. Caching using Redis

Store frequently accessed notifications or unread notification counts in Redis.

Workflow:
- First request → fetch from DB
- Store response in Redis
- Future requests → serve from cache
- Refresh cache when new notifications arrive

Benefits:
- Reduces DB load
- Faster response times

Tradeoffs:
- Extra infrastructure needed
- Cache invalidation complexity

---

### 2. Pagination / Lazy Loading

Instead of loading all notifications at once:

Example:
- Page 1 → first 20 notifications
- Load more on scroll

Benefits:
- Smaller DB queries
- Reduced network usage

Tradeoffs:
- Additional frontend logic
- Multiple API calls for large history

---

### 3. WebSocket / Push Updates

Instead of polling database on every page load:

- Client establishes persistent connection
- Server pushes only new notifications

Benefits:
- Real-time updates
- Eliminates repeated fetching

Tradeoffs:
- More server memory for active connections
- WebSocket scaling complexity

---

### 4. Read Replica Database

Use replicas for read-heavy operations.

Architecture:
- Primary DB handles writes
- Replica DB handles reads

Benefits:
- Improves scalability
- Reduces load on main DB

Tradeoffs:
- Replication lag
- Additional infrastructure cost

---

## Recommended Architecture

Best solution is a combination of:

- Redis caching
- Pagination
- WebSockets
- Read replicas

This ensures:
- Fast reads
- Real-time updates
- Reduced database load
- Better scalability

# Stage 5

## Shortcomings of Current Implementation

Given pseudocode:

```python
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)
        save_to_db(student_id, message)
        push_to_app(student_id, message)
```

Problems:

### 1. Sequential Processing
Each student is processed one by one.

For 50,000 students:
- Very slow
- High latency
- Poor scalability

### 2. Single Point of Failure
If one email API call fails, the loop may stop or become inconsistent.

### 3. Tight Coupling
Email sending, DB storage, and app push are tightly connected.

Failure in one service affects all others.

### 4. No Retry Mechanism
Temporary failures are not retried.

### 5. No Fault Tolerance
System cannot recover gracefully from crashes.

---

## If Email Fails for 200 Students

Logs show 200 email failures.

Problems:
- Some students receive notification
- Some students miss email
- Data becomes inconsistent

Solution:
Failed email jobs should be moved to a retry queue.

Example:
- Retry after 1 minute
- Retry after 5 minutes
- Retry after 15 minutes

After max retries:
- Move to dead-letter queue
- Alert admins

---

## Improved Design

Use asynchronous event-driven architecture.

Components:

1. Notification Producer
2. Message Queue (RabbitMQ / Kafka)
3. Email Worker
4. DB Worker
5. Push Notification Worker

Flow:

1. HR clicks “Notify All”
2. Bulk jobs pushed into queue
3. Workers process jobs independently
4. Failed jobs automatically retry

Benefits:
- Fast
- Reliable
- Scalable
- Fault tolerant

---

## Should DB Save and Email Happen Together?

No.

They should be decoupled.

Reason:

Saving notification in DB is critical system data.

Email delivery is an external service and may fail.

If both are tightly coupled:
- Email failure may block DB write

Best approach:
1. Save notification first
2. Publish async email job

This ensures notification is never lost.

---

## Revised Pseudocode

```python
function notify_all(student_ids, message):

    batch = []

    for student_id in student_ids:
        notification = {
            "student_id": student_id,
            "message": message
        }

        batch.append(notification)

    save_bulk_notifications(batch)

    for notification in batch:
        queue.publish("email_jobs", notification)
        queue.publish("push_jobs", notification)
```

### Email Worker

```python
while True:
    job = queue.consume("email_jobs")

    try:
        send_email(job.student_id, job.message)
    except:
        retry(job)
```

### Push Worker

```python
while True:
    job = queue.consume("push_jobs")
    push_to_app(job.student_id, job.message)
```