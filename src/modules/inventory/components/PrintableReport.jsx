import React from 'react';

const COLUMN_MAP = {
  'current-stock': [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'category_name', label: 'Category' },
    { key: 'brand_name', label: 'Brand' },
    { key: 'unit_name', label: 'Unit' },
    { key: 'physical', label: 'Physical' },
    { key: 'reserved', label: 'Reserved' },
    { key: 'available', label: 'Available' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'damaged', label: 'Damaged' },
    { key: 'cost_price', label: 'Cost Price' },
    { key: 'selling_price', label: 'Selling Price' },
  ],
  'stock-ledger': [
    { key: 'created_at', label: 'Date' },
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'transaction_type', label: 'Type' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit_cost', label: 'Unit Cost' },
    { key: 'total_cost', label: 'Total Cost' },
    { key: 'reference_type', label: 'Reference' },
    { key: 'description', label: 'Description' },
  ],
  'stock-summary': [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'category_name', label: 'Category' },
    { key: 'unit_name', label: 'Unit' },
    { key: 'location_name', label: 'Location' },
    { key: 'physical_quantity', label: 'Physical' },
    { key: 'reserved_quantity', label: 'Reserved' },
    { key: 'available_quantity', label: 'Available' },
    { key: 'in_transit_quantity', label: 'In Transit' },
    { key: 'damaged_quantity', label: 'Damaged' },
  ],
  'stock-movement': [
    { key: 'item__item_code', label: 'Item Code' },
    { key: 'item__item_name', label: 'Item Name' },
    { key: 'transaction_type', label: 'Type' },
    { key: 'total_quantity', label: 'Total Qty' },
    { key: 'total_cost', label: 'Total Cost' },
    { key: 'entry_count', label: 'Entries' },
  ],
  valuation: [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'category_name', label: 'Category' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit_cost', label: 'Unit Cost' },
    { key: 'total_value', label: 'Total Value' },
  ],
  'reserved-stock': [
    { key: 'item__item_code', label: 'Item Code' },
    { key: 'item__item_name', label: 'Item Name' },
    { key: 'reserved_qty', label: 'Reserved Qty' },
    { key: 'reservation_count', label: 'Reservations' },
  ],
  'damaged-stock': [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'location_name', label: 'Location' },
    { key: 'damaged_qty', label: 'Damaged Qty' },
  ],
  adjustments: [
    { key: 'adjustment_number', label: 'Adj. Number' },
    { key: 'adjustment_date', label: 'Date' },
    { key: 'location_name', label: 'Location' },
    { key: 'adjustment_type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'item_count', label: 'Items' },
  ],
  transfers: [
    { key: 'transfer_number', label: 'Transfer #' },
    { key: 'transfer_date', label: 'Date' },
    { key: 'source_name', label: 'From' },
    { key: 'destination_name', label: 'To' },
    { key: 'transfer_type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ],
  reservations: [
    { key: 'reservation_number', label: 'Reservation #' },
    { key: 'reservation_date', label: 'Date' },
    { key: 'expiry_date', label: 'Expires' },
    { key: 'source_name', label: 'Source' },
    { key: 'reservation_type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
  ],
  'stock-counts': [
    { key: 'count_number', label: 'Count #' },
    { key: 'count_date', label: 'Date' },
    { key: 'location_name', label: 'Location' },
    { key: 'count_type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'item_count', label: 'Items' },
  ],
  'purchase-orders': [
    { key: 'order_number', label: 'PO #' },
    { key: 'order_date', label: 'Date' },
    { key: 'expected_delivery_date', label: 'Expected' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'status', label: 'Status' },
    { key: 'total_amount', label: 'Amount' },
  ],
  'goods-receipts': [
    { key: 'grn_number', label: 'GRN #' },
    { key: 'receipt_date', label: 'Date' },
    { key: 'purchase_order_number', label: 'PO #' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'location_name', label: 'Location' },
    { key: 'status', label: 'Status' },
  ],
  'purchase-returns': [
    { key: 'return_number', label: 'Return #' },
    { key: 'return_date', label: 'Date' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'status', label: 'Status' },
    { key: 'total_amount', label: 'Amount' },
  ],
  'supplier-invoice': [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'invoice_date', label: 'Date' },
    { key: 'due_date', label: 'Due' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'status', label: 'Status' },
    { key: 'payment_status', label: 'Payment' },
    { key: 'grand_total', label: 'Total' },
  ],
  'low-stock': [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'current_stock', label: 'Current Stock' },
    { key: 'min_stock_level', label: 'Min Level' },
    { key: 'reorder_level', label: 'Reorder At' },
    { key: 'suggested_purchase', label: 'Suggested Purchase' },
  ],
  'out-of-stock': [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'current_stock', label: 'Current Stock' },
  ],
  reorder: [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'category_name', label: 'Category' },
    { key: 'current_stock', label: 'Current Stock' },
    { key: 'reorder_level', label: 'Reorder At' },
    { key: 'suggested_order', label: 'Suggested Order' },
  ],
  'fast-moving': [
    { key: 'item__item_code', label: 'Item Code' },
    { key: 'item__item_name', label: 'Item Name' },
    { key: 'item__unit__unit_name', label: 'Unit' },
    { key: 'total', label: 'Movement' },
  ],
  'slow-moving': [
    { key: 'item__item_code', label: 'Item Code' },
    { key: 'item__item_name', label: 'Item Name' },
    { key: 'item__unit__unit_name', label: 'Unit' },
    { key: 'total', label: 'Total' },
  ],
  'dead-stock': [
    { key: 'item__item_code', label: 'Item Code' },
    { key: 'item__item_name', label: 'Item Name' },
    { key: 'item__unit__unit_name', label: 'Unit' },
    { key: 'total', label: 'Total' },
  ],
  'inventory-aging': [
    { key: 'bucket', label: 'Age Bucket' },
    { key: 'value', label: 'Value' },
  ],
};

const FILTER_LABELS = {
  search: 'Search',
  date_from: 'Date From',
  date_to: 'Date To',
  location_id: 'Location',
  category_id: 'Category',
  supplier_id: 'Supplier',
  status: 'Status',
};

const PrintableReport = React.forwardRef(({ printData }, ref) => {
  if (!printData) return <div ref={ref} className="printable-report print-only" />;

  const { reportType, title, data, filters, totalRecords } = printData;
  const columns = COLUMN_MAP[reportType];
  const fields = columns || (
    data.length > 0
      ? Object.keys(data[0]).slice(0, 10).map(k => ({ key: k, label: k.replace(/__/g, ' ').replace(/_/g, ' ') }))
      : []
  );
  const filterEntries = Object.entries(filters || {}).filter(([, v]) => v != null && v !== '');

  return (
    <div ref={ref} className="printable-report print-only">
      <div className="print-body">
        <div className="print-header">
          <div className="print-company">ByteHive Digital</div>
          <div className="print-divider" />
          <h1 className="print-title">{title}</h1>
          <div className="print-meta">
            Generated: {new Date().toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
            <span className="print-meta-sep">|</span>
            Records: {totalRecords}
          </div>
          {filterEntries.length > 0 && (
            <div className="print-filters">
              {filterEntries.map(([k, v]) => (
                <span key={k} className="print-filter-tag">
                  {FILTER_LABELS[k] || k.replace(/_/g, ' ')}: {v}
                </span>
              ))}
            </div>
          )}
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th className="print-th-row">#</th>
              {fields.map(f => <th key={f.key}>{f.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="print-td-row">{i + 1}</td>
                {fields.map(f => (
                  <td key={f.key}>{row[f.key] != null ? String(row[f.key]) : '\u2014'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="print-footer">
        <span>ByteHive Digital</span>
        <span className="page-number" />
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
