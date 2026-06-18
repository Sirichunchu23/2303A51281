import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export function NotificationCard({ notification }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Chip label={notification.Type} color="primary" size="small" />
          </Stack>

          <Typography variant="body1">
            {notification.Message}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {notification.Timestamp}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}