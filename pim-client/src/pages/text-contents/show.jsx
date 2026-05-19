import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { Typography, Grid, Chip, Box, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Draft: "default",
  InReview: "warning",
  Approved: "success",
  Published: "info",
  Archived: "error",
};

export const TextContentShow = () => {
  const { query } = useShow({ resource: "text-contents" });
  const record = query?.data?.data;
  const navigate = useNavigate();

  const handleApprove = async () => {
    const email = prompt("Enter approver email:");
    if (!email) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    await fetch(`${API_URL}/text-contents/${record.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedByEmail: email }),
    });
    query.refetch();
  };

  if (!record) return null;

  return (
    <Show>
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        {record.status !== "Approved" && record.status !== "Published" && (
          <Button variant="contained" color="success" onClick={handleApprove}>
            Approve
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Title</Typography>
          <Typography variant="body1" gutterBottom>{record.title}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Content Type</Typography>
          <Chip label={record.contentType} size="small" variant="outlined" />
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
          <Chip label={record.status} size="small" color={statusColors[record.status] || "default"} />
        </Grid>

        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Language</Typography>
          <Typography variant="body1">{record.languageCode}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Version</Typography>
          <Typography variant="body1">{record.version}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Author</Typography>
          <Typography variant="body1">{record.authorName}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Author Email</Typography>
          <Typography variant="body1">{record.authorEmail}</Typography>
        </Grid>

        {record.approvedByEmail && (
          <>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
              <Typography variant="body1">{record.approvedByEmail}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Approved At</Typography>
              <Typography variant="body1">
                {record.approvedAt ? new Date(record.approvedAt).toLocaleString() : "—"}
              </Typography>
            </Grid>
          </>
        )}

        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Created</Typography>
          <Typography variant="body1">{new Date(record.createdAt).toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" color="text.secondary">Updated</Typography>
          <Typography variant="body1">{new Date(record.updatedAt).toLocaleString()}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Body</Typography>
      <Box
        sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1, minHeight: 100 }}
        dangerouslySetInnerHTML={{ __html: record.body }}
      />
    </Show>
  );
};
