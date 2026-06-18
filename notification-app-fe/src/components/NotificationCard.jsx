import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export function NotificationCard({ notification }) {
  const key = `notif_${notification.ID}`;
  const isViewed = localStorage.getItem(key) === "read";

  const markAsRead = () => {
    localStorage.setItem(key, "read");
  };

  return (
    <Card
      onClick={markAsRead}
      sx={{
        backgroundColor: isViewed ? "#fff" : "#e3f2fd",
        cursor: "pointer",
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Chip label={notification.Type} size="small" />

          <Typography>{notification.Message}</Typography>

          <Typography variant="caption">
            {notification.Timestamp}
          </Typography>

          {!isViewed && (
            <Chip label="NEW" color="success" size="small" />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}