import { useForm } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { TextField, Grid, MenuItem, Box, Autocomplete } from "@mui/material";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const contentTypes = [
  { value: "DesignDescriptionB2B", label: "Design Description B2B" },
  { value: "DesignDescriptionB2C", label: "Design Description B2C" },
  { value: "UniqueSellingProposition", label: "Unique Selling Proposition" },
  { value: "CareInstruction", label: "Care Instruction" },
  { value: "UpholsteryDescription", label: "Upholstery Description" },
  { value: "TechnicalDescription", label: "Technical Description" },
  { value: "Other", label: "Other" },
];

const statuses = [
  { value: "Draft", label: "Draft" },
  { value: "InReview", label: "In Review" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "da", label: "Danish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "vi", label: "Vietnamese" },
];

export const TextContentCreate = () => {
  const { onFinish, formLoading } = useForm({ resource: "text-contents", action: "create" });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${API_URL}/products?_start=0&_end=200`)
      .then((r) => r.json())
      .then((json) => setProducts(json.data ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    values.productId = selectedProduct?.id || "";
    values.body = body;
    onFinish(values);
  };

  return (
    <Create isLoading={formLoading} saveButtonProps={{ type: "submit", form: "text-content-create" }}>
      <Box component="form" id="text-content-create" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={products}
              getOptionLabel={(opt) => `${opt.name || opt.masterNumber} (${opt.masterNumber})`}
              value={selectedProduct}
              onChange={(_, val) => setSelectedProduct(val)}
              renderInput={(params) => (
                <TextField {...params} label="Product" required fullWidth margin="normal" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="contentType"
              label="Content Type"
              select
              fullWidth
              margin="normal"
              defaultValue="DesignDescriptionB2B"
              required
            >
              {contentTypes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="languageCode"
              label="Language"
              select
              fullWidth
              margin="normal"
              defaultValue="en"
              required
            >
              {languages.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="status"
              label="Status"
              select
              fullWidth
              margin="normal"
              defaultValue="Draft"
            >
              {statuses.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField name="title" label="Title" fullWidth margin="normal" required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField name="authorName" label="Author Name" fullWidth margin="normal" required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField name="authorEmail" label="Author Email" type="email" fullWidth margin="normal" required />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 1, mb: 2 }}>
              <ReactQuill theme="snow" value={body} onChange={setBody} style={{ minHeight: 200 }} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Create>
  );
};
