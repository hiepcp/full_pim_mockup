import { useList } from "@refinedev/core";
import { List } from "@refinedev/mui";
import { Grid, Card, CardMedia, CardContent, Typography, Chip, Stack, CardActionArea, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function AssetList() {
  const { data, isLoading } = useList({
    resource: "assets",
    pagination: { pageSize: 12 },
  });

  const navigate = useNavigate();
  const assets = data?.data || [];

  return (
    <List>
      <Grid container spacing={2}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={180} />
                  <CardContent>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : assets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea onClick={() => navigate(`/assets/show/${asset.id}`)}>
                    <CardMedia
                      component="img"
                      height={180}
                      image={asset.thumbnailUrl || "/placeholder-image.svg"}
                      alt={asset.fileName}
                      sx={{ objectFit: "cover", bgcolor: "#f5f5f5" }}
                    />
                    <CardContent>
                      <Typography variant="body2" noWrap fontWeight={600}>
                        {asset.fileName}
                      </Typography>
                      <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                        <Chip label={asset.assetType || "Image"} size="small" variant="outlined" />
                        <Chip
                          label={asset.status || "Pending"}
                          size="small"
                          color={asset.status === "Approved" ? "success" : "default"}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" mt={1} display="block">
                        {asset.productName || "Unlinked"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>
    </List>
  );
}
