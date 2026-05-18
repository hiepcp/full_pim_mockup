import { useForm } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { TextField, Grid, MenuItem, Box } from "@mui/material";

export function ProductCreate() {
  const { formLoading, onFinish } = useForm({
    resource: "products",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    onFinish(values);
  };

  return (
    <Create isLoading={formLoading}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Product Name" name="name" required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Range Name" name="rangeName" />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Master Number" name="masterNumber" />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="Variant Number" name="variantNumber" />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth select label="Status" name="status" defaultValue="Draft">
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Review">Review</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth label="D365 Item Number" name="d365ItemNumber" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Description" name="description" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="USP" name="usp" />
          </Grid>
        </Grid>
      </Box>
    </Create>
  );
}
