import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../InvoiceList/StatusBadge';
import Button from '@/components/Button';
import { useInvoiceDetail } from '../../hooks/useInvoice';
import { useInvoiceActions } from '../../hooks/useInvoiceActions';
import { formatINR } from '../../utils/gstUtils';

/**
 * Invoice detail page — shows all fields, line items, GST breakdown, and status log.
 */
const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoice, loading, error, refetch } = useInvoiceDetail(id);
  const { submitInvoice, downloadPDF, loading: actionLoading } = useInvoiceActions();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-20 text-white/40">
        <p>{error || 'Invoice not found.'}</p>
        <button
          onClick={() => navigate('/invoices')}
          className="mt-4 text-sm text-white/60 hover:text-white underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    const result = await submitInvoice(invoice.id);
    if (result.success) refetch();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{invoice.invoice_number}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-white/40 text-sm">
            {invoice.domain} ·{' '}
            {new Date(invoice.created_at).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-3">
          {invoice.status === 'draft' && (
            <>
              <Button
                variant="secondary"
                className="w-auto px-4 py-2"
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="primary"
                className="w-auto px-4 py-2"
                disabled={actionLoading}
                onClick={handleSubmit}
              >
                Submit for Review
              </Button>
            </>
          )}
          {(invoice.status === 'approved' || invoice.status === 'completed') && invoice.pdf_url && (
            <Button
              variant="primary"
              className="w-auto px-4 py-2"
              disabled={actionLoading}
              onClick={() => downloadPDF(invoice.id, invoice.invoice_number)}
            >
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Rejection notice */}
      {invoice.status === 'rejected' && invoice.admin_remarks && (
        <div className="p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-sm text-red-400">
          <span className="font-semibold">Rejection Reason: </span>
          {invoice.admin_remarks}
        </div>
      )}

      {/* Main info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Client">
          <Field label="Name" value={invoice.client_name} />
          {invoice.client_email && <Field label="Email" value={invoice.client_email} />}
          {invoice.client_address && <Field label="Address" value={invoice.client_address} />}
          {invoice.client_gstin && <Field label="GSTIN" value={invoice.client_gstin} />}
        </InfoCard>

        <InfoCard title="GST Details">
          <Field label="Supply Type" value={invoice.supply_type_display} />
          {invoice.place_of_supply && <Field label="Place of Supply" value={invoice.place_of_supply} />}
          {invoice.supplier_gstin && <Field label="Supplier GSTIN" value={invoice.supplier_gstin} />}
        </InfoCard>
      </div>

      {/* Extra data */}
      {invoice.extra_data && Object.keys(invoice.extra_data).length > 0 && (
        <InfoCard title="Additional Details">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(invoice.extra_data).map(([key, value]) => (
              <Field key={key} label={key.replace(/_/g, ' ')} value={String(value)} />
            ))}
          </div>
        </InfoCard>
      )}

      {/* Line items */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/70">Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                <th className="text-left px-5 py-3">Description</th>
                <th className="text-left px-3 py-3">HSN</th>
                <th className="text-right px-3 py-3">Qty</th>
                <th className="text-right px-3 py-3">Rate</th>
                <th className="text-right px-3 py-3">GST</th>
                <th className="text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {invoice.line_items?.map((item, idx) => (
                <tr key={idx} className="text-white/80">
                  <td className="px-5 py-3">{item.description}</td>
                  <td className="px-3 py-3 text-white/50">{item.hsn_sac_code || '—'}</td>
                  <td className="px-3 py-3 text-right">{item.quantity}</td>
                  <td className="px-3 py-3 text-right">₹ {formatINR(item.unit_price)}</td>
                  <td className="px-3 py-3 text-right text-white/50">{item.gst_rate}%</td>
                  <td className="px-5 py-3 text-right font-medium">₹ {formatINR(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2 bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <TotalRow label="Subtotal" value={`₹ ${formatINR(invoice.subtotal)}`} />
          {invoice.supply_type === 'intra_state' ? (
            <>
              <TotalRow label="CGST" value={`₹ ${formatINR(invoice.cgst_total)}`} />
              <TotalRow label="SGST" value={`₹ ${formatINR(invoice.sgst_total)}`} />
            </>
          ) : (
            <TotalRow label="IGST" value={`₹ ${formatINR(invoice.igst_total)}`} />
          )}
          {parseFloat(invoice.discount_amount) > 0 && (
            <TotalRow label="Discount" value={`− ₹ ${formatINR(invoice.discount_amount)}`} className="text-red-400" />
          )}
          <div className="border-t border-white/10 pt-2">
            <TotalRow
              label="Grand Total"
              value={`${invoice.currency} ${formatINR(invoice.grand_total)}`}
              bold
            />
          </div>
        </div>
      </div>

      {/* Status log */}
      {invoice.status_logs?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Status History</h3>
          <div className="space-y-3">
            {invoice.status_logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/30 mt-1.5 shrink-0" />
                <div>
                  <span className="text-white/70">
                    {log.from_status ? `${log.from_status} → ` : ''}{log.to_status}
                  </span>
                  {log.note && <span className="text-white/40"> — {log.note}</span>}
                  <p className="text-white/30 text-xs mt-0.5">
                    {log.actor?.email} ·{' '}
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ title, children }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex gap-2 text-sm">
    <span className="text-white/40 shrink-0 capitalize">{label}:</span>
    <span className="text-white/80">{value}</span>
  </div>
);

const TotalRow = ({ label, value, bold, className = '' }) => (
  <div className={`flex justify-between text-sm ${bold ? 'font-bold text-white' : 'text-white/60'} ${className}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default InvoiceDetail;
