import React from 'react';
import InvoiceForm from '../components/InvoiceForm';

const InvoiceCreatePage = () => (
  <div className="h-full overflow-hidden flex flex-col p-8">
    <div className="mb-8 flex-shrink-0">
      <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
      <p className="text-white/40 text-sm mt-1">Fill in the details to create a new draft invoice</p>
    </div>
    <div className="flex-1 overflow-y-auto min-h-0 scroll-smooth no-scrollbar">
      <InvoiceForm />
    </div>
  </div>
);

export default InvoiceCreatePage;
