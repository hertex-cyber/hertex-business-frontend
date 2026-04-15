import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import { useInvoiceDetail } from '../hooks/useInvoice';

const InvoiceEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoice, loading, error } = useInvoiceDetail(id);

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

  if (invoice.status !== 'draft' && invoice.status !== 'rejected') {
    return (
      <div className="text-center py-20 text-white/40">
        <p>Only draft or rejected invoices can be edited.</p>
        <button
          onClick={() => navigate(`/invoices/${id}`)}
          className="mt-4 text-sm text-white/60 hover:text-white underline"
        >
          View invoice
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {invoice.status === 'rejected' ? 'Revise Invoice' : 'Edit Invoice'}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {invoice.status === 'rejected'
              ? 'Update the invoice and resubmit for admin review'
              : `Editing draft — ${invoice.invoice_number}`}
          </p>
        </div>
        {invoice.status === 'rejected' && invoice.admin_remarks && (
          <div className="mb-6 p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-sm text-red-400">
            <span className="font-semibold">Rejection reason: </span>
            {invoice.admin_remarks}
          </div>
        )}
        <InvoiceForm invoice={invoice} />
      </div>
    </div>
  );
};

export default InvoiceEditPage;
