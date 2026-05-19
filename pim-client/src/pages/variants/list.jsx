import { useDataGrid, List } from "@refinedev/mui";
import { DataGrid } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

export function VariantList() {
  const { dataGridProps } = useDataGrid({
    resource: "variants",
  });

  const columns = [
    { field: "productMasterNumber", headerName: "Master #", width: 130 },
    { field: "variantNumber", headerName: "Variant #", flex: 1, minWidth: 200 },
    { field: "productName", headerName: "Product Name", flex: 1, minWidth: 200 },
    { field: "colorId", headerName: "Color", width: 120 },
    { field: "sizeId", headerName: "Size", width: 100 },
    { field: "styleId", headerName: "Style", width: 120 },
    { field: "configurationId", headerName: "Configuration", width: 140 },
    { field: "rangeName", headerName: "Range", width: 130 },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value === 0 ? "Active" : "Inactive"}
          size="small"
          color={value === 0 ? "success" : "default"}
        />
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
