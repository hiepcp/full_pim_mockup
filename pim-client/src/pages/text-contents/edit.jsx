import { useForm } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { TextField, Grid, MenuItem, Box } from "@mui/material";
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
  { value: "Approved", label: "Approved" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "da", label: "Danish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "vi", label: "Vietnamese" },
];

export const TextContentEdit = () => {
  const { onFinish, formLoading, query } = useForm({ resource: "text-contents", action: "edit" });
  const record = query?.data?.data;
  const [body, setBody] = useState("");

  useEffect(() => {
    if (record?.body) {
      setBody(record.body);
    }
  }, [record]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    values.body = body;
    onFinish(values);
  };

  if (!record) return null;

  return (
    <Edit isLoading={formLoading} saveButtonProps={{ type: "submit", form: "text-content-edit" }}>
      <Box component="form" id="text-content-edit" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              name="contentType"
              label="Content Type"
              select
              fullWidth
              margin="normal"
              defaultValue={record.contentType}
              required
            >
              {contentTypes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="languageCode"
              label="Language"
              select
              fullWidth
              margin="normal"
              defaultValue={record.languageCode}
              required
            >
              {languages.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="status"
              label="Status"
              select
              fullWidth
              margin="normal"
              defaultValue={record.status}
            >
              {statuses.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Title"
              fullWidth
              margin="normal"
              defaultValue={record.title}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 1, mb: 2 }}>
              <ReactQuill theme="snow" value={body} onChange={setBody} style={{ minHeight: 200 }} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Edit>
  );
};
