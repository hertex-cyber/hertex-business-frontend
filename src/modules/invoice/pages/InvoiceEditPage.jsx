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

  if (invoice.status !== 'draft') {
    return (
      <div className="text-center py-20 text-white/40">
        <p>Only draft invoices can be edited.</p>
        <button
          onClick={() => navigate(`/invoices/${id}`)}
          className="mt-4 text-sm text-white/60 hover:text-white underline"
        >
          View invoice
        </button>
      </div>
    );
  }

  return <InvoiceForm invoice={invoice} />;
};

export default InvoiceEditPage;
