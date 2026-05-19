import { useDataGrid, List, ShowButton, EditButton, DeleteButton } from "@refinedev/mui";
import { DataGrid } from "@mui/x-data-grid";
import { Stack, Chip } from "@mui/material";

const statusColors = {
  Draft: "default",
  InReview: "warning",
  Approved: "success",
  Published: "info",
  Archived: "error",
};

const contentTypeLabels = {
  DesignDescriptionB2B: "Design B2B",
  DesignDescriptionB2C: "Design B2C",
  UniqueSellingProposition: "USP",
  CareInstruction: "Care",
  UpholsteryDescription: "Upholstery",
  TechnicalDescription: "Technical",
  Other: "Other",
};

export const TextContentList = () => {
  const { dataGridProps } = useDataGrid({
    resource: "text-contents",
  });

  const columns = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    {
      field: "contentType",
      headerName: "Type",
      width: 140,
      renderCell: ({ value }) => (
        <Chip label={contentTypeLabels[value] || value} size="small" variant="outlined" />
      ),
    },
    { field: "languageCode", headerName: "Lang", width: 70 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color={statusColors[value] || "default"} />
      ),
    },
    { field: "authorName", headerName: "Author", width: 150 },
    { field: "version", headerName: "Ver", width: 60, type: "number" },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 160,
      renderCell: ({ value }) => value ? new Date(value).toLocaleDateString() : "",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <ShowButton hideText recordItemId={row.id} resource="text-contents" />
          <EditButton hideText recordItemId={row.id} resource="text-contents" />
          <DeleteButton hideText recordItemId={row.id} resource="text-contents" />
        </Stack>
      ),
    },
  ];

  return (
    <List>
      <DataGrid
        {...dataGridProps}
        columns={columns}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
      />
    </List>
  );
};
