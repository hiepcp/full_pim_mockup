import { Box, Card, CardContent, Grid, Typography, Stack } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";

const stats = [
  { title: "Products", value: "1,247", icon: <InventoryIcon fontSize="large" color="primary" />, color: "#e3f2fd" },
  { title: "Visual Assets", value: "8,432", icon: <ImageIcon fontSize="large" color="secondary" />, color: "#fce4ec" },
  { title: "Documents", value: "356", icon: <DescriptionIcon fontSize="large" color="success" />, color: "#e8f5e9" },
  { title: "Ready to Publish", value: "892", icon: <CheckCircleIcon fontSize="large" color="info" />, color: "#e0f7fa" },
];

export function Dashboard() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Recent Activity</Typography>
              <Stack spacing={1.5}>
                {[
                  "Product 'Sofa Nordic' updated - 2 min ago",
                  "15 images uploaded for Range 'Outdoor 2026' - 12 min ago",
                  "D365 sync completed - 847 products synced - 15 min ago",
                  "AI text generated for 23 products - 28 min ago",
                  "Campaign 'Summer Launch' published to Instagram - 1h ago",
                ].map((item, i) => (
                  <Typography key={i} variant="body2" color="text.secondary">
                    • {item}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Completeness Score</Typography>
              <Stack spacing={1}>
                {[
                  { range: "Indoor Living", score: 94 },
                  { range: "Outdoor 2026", score: 72 },
                  { range: "Office Pro", score: 88 },
                  { range: "Kids Collection", score: 61 },
                ].map((item) => (
                  <Box key={item.range}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{item.range}</Typography>
                      <Typography variant="body2" fontWeight={600}>{item.score}%</Typography>
                    </Stack>
                    <Box sx={{ width: "100%", bgcolor: "#f0f0f0", borderRadius: 1, height: 8, mt: 0.5 }}>
                      <Box sx={{ width: `${item.score}%`, bgcolor: item.score > 80 ? "success.main" : "warning.main", borderRadius: 1, height: 8 }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
