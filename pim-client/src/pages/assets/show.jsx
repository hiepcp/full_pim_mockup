import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { Typography, Grid, Box, Chip, Stack, Divider } from "@mui/material";

export function AssetShow() {
  const { query } = useShow();
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      {record && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Box
              component="img"
              src={record.url || record.thumbnailUrl || "/placeholder-image.svg"}
              alt={record.fileName}
              sx={{ width: "100%", maxHeight: 500, objectFit: "contain", bgcolor: "#fafafa", borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">File Name</Typography>
                <Typography variant="h6">{record.fileName}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Box mt={0.5}>
                  <Chip label={record.assetType || "Image"} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={record.status || "Pending"}
                    color={record.status === "Approved" ? "success" : "default"}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Dimensions</Typography>
                <Typography>
                  {record.width && record.height ? `${record.width} × ${record.height}px` : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">File Size</Typography>
                <Typography>{record.fileSize ? `${(record.fileSize / 1024).toFixed(1)} KB` : "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Linked Product</Typography>
                <Typography>{record.productName || "Unlinked"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Uploaded</Typography>
                <Typography>{record.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Show>
  );
}
