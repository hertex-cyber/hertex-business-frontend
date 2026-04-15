import React from 'react';
import InvoiceForm from '../components/InvoiceForm';

const InvoiceCreatePage = () => (
  <div className="p-8">
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
        <p className="text-white/40 text-sm mt-1">Fill in the details to create a new draft invoice</p>
      </div>
      <InvoiceForm />
    </div>
  </div>
);

export default InvoiceCreatePage;
