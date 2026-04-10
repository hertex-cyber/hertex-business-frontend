import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import Button from '@/components/Button';
import { useInvoiceList } from '../../hooks/useInvoice';
import { useInvoiceActions } from '../../hooks/useInvoiceActions';
import { formatINR } from '../../utils/gstUtils';

/**
 * Invoice list page — shows the current user's invoices with actions.
 */
const InvoiceList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: '', domain: '' });
  const { invoices, count, loading, error, refetch } = useInvoiceList(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  );
  const { submitInvoice, downloadPDF, loading: actionLoading } = useInvoiceActions();

  const handleSubmit = async (invoice) => {
    const result = await submitInvoice(invoice.id);
    if (result.success) refetch();
  };

  const handleDownload = (invoice) => {
    downloadPDF(invoice.id, invoice.invoice_number);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-white/40 text-sm mt-1">{count} invoice{count !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters + New Invoice */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <select
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-white/30 transition-all"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="" className="bg-gray-900">All Statuses</option>
            <option value="draft" className="bg-gray-900">Draft</option>
            <option value="pending" className="bg-gray-900">Pending</option>
            <option value="approved" className="bg-gray-900">Approved</option>
            <option value="rejected" className="bg-gray-900">Rejected</option>
            <option value="completed" className="bg-gray-900">Completed</option>
          </select>
        </div>
        <Button variant="primary" onClick={() => navigate('/invoices/new')} className="w-auto px-5">
          + New Invoice
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && invoices.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p className="text-lg">No invoices yet.</p>
          <p className="text-sm mt-2">Create your first invoice to get started.</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="text-white font-semibold text-sm hover:underline cursor-pointer"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    {invoice.invoice_number}
                  </span>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="text-white/60 text-sm truncate">{invoice.client_name}</p>
                <p className="text-white/30 text-xs">
                  {invoice.domain} ·{' '}
                  {new Date(invoice.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-white font-semibold">
                  {invoice.currency} {formatINR(invoice.grand_total)}
                </span>

                {invoice.status === 'draft' && (
                  <>
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSubmit(invoice)}
                      disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </>
                )}

                {(invoice.status === 'approved' || invoice.status === 'completed') && (
                  <button
                    onClick={() => handleDownload(invoice)}
                    disabled={actionLoading}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] transition-all disabled:opacity-50"
                  >
                    Download PDF
                  </button>
                )}

                {invoice.status === 'rejected' && (
                  <button
                    onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                  >
                    Revise
                  </button>
                )}
              </div>
            </div>

            {invoice.status === 'rejected' && invoice.admin_remarks && (
              <div className="mt-3 p-3 bg-red-500/[0.06] border border-red-500/10 rounded-lg text-xs text-red-400">
                <span className="font-semibold">Rejection reason: </span>
                {invoice.admin_remarks}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceList;
