import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { Typography, Grid, Stack, Chip, Box, Divider } from "@mui/material";

export function ProductShow() {
  const { query } = useShow();
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      {record && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Product Name</Typography>
                <Typography variant="h6">{record.name}</Typography>
              </Box>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Range</Typography>
                  <Typography>{record.rangeName}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Master #</Typography>
                  <Typography>{record.masterNumber}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Variant #</Typography>
                  <Typography>{record.variantNumber}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography>{record.description || "No description yet"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">USP</Typography>
                <Typography>{record.usp || "—"}</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={record.status || "Draft"}
                    color={record.status === "Published" ? "success" : record.status === "Review" ? "warning" : "default"}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Completeness</Typography>
                <Typography variant="h4" fontWeight={700}>{record.completenessScore ?? 0}%</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">D365 Item Number</Typography>
                <Typography>{record.d365ItemNumber || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Last Synced</Typography>
                <Typography>{record.lastSyncedAt ? new Date(record.lastSyncedAt).toLocaleString() : "Never"}</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Show>
  );
}
