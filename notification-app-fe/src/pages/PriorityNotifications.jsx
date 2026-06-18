import { useEffect, useState } from "react";
import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { fetchNotifications } from "../api/notifications";
import { NotificationCard } from "../components/NotificationCard";

export function PriorityNotifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetchNotifications({
          page: 1,
          limit: 5
        });

        setData(res.notifications || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", p: 3 }}>
      <Typography variant="h5" mb={2}>
        Priority Notifications
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {data.map((n) => (
            <NotificationCard key={n.ID} notification={n} />
          ))}
        </Stack>
      )}
    </Box>
  );
}