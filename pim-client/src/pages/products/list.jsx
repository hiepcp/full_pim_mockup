import { useDataGrid, List, ShowButton, EditButton, DeleteButton } from "@refinedev/mui";
import { DataGrid } from "@mui/x-data-grid";
import { Stack, Chip } from "@mui/material";

export function ProductList() {
  const { dataGridProps } = useDataGrid({
    resource: "products",
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "rangeName", headerName: "Range", flex: 1, minWidth: 150 },
    { field: "masterNumber", headerName: "Master #", width: 130 },
    { field: "variantNumber", headerName: "Variant #", width: 130 },
    { field: "name", headerName: "Product Name", flex: 1, minWidth: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          label={value || "Draft"}
          size="small"
          color={value === "Published" ? "success" : value === "Review" ? "warning" : "default"}
        />
      ),
    },
    {
      field: "completenessScore",
      headerName: "Score",
      width: 90,
      renderCell: ({ value }) => `${value ?? 0}%`,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <ShowButton hideText recordItemId={row.id} />
          <EditButton hideText recordItemId={row.id} />
          <DeleteButton hideText recordItemId={row.id} />
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
}
