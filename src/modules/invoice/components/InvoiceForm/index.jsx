import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SupplyTypeSelector from './SupplyTypeSelector';
import DynamicFields from './DynamicFields';
import LineItemsTable, { EMPTY_ITEM } from './LineItemsTable';
import GSTSummary from './GSTSummary';
import { useInvoiceSchemas } from '../../hooks/useInvoiceSchema';
import { useGSTCalculator } from '../../hooks/useGSTCalculator';
import { useInvoiceActions } from '../../hooks/useInvoiceActions';

const DEFAULT_FORM = {
  domain: '',
  schema: '',
  client_name: '',
  client_email: '',
  client_address: '',
  client_gstin: '',
  supply_type: 'intra_state',
  place_of_supply: '',
  discount_amount: '0',
  currency: 'INR',
  notes: '',
  due_date: '',
  extra_data: {},
  line_items: [EMPTY_ITEM()],
};

/**
 * Main invoice creation / edit form.
 * Fetches InvoiceSchemas to populate domain selector and render extra_data fields.
 *
 * @param {Object}   [invoice]    - existing invoice for edit mode
 * @param {Function} [onSuccess]  - called with saved invoice on success
 */
const InvoiceForm = ({ invoice = null, onSuccess }) => {
  const navigate = useNavigate();
  const isEdit = !!invoice;

  const { schemas, loading: schemasLoading } = useInvoiceSchemas();
  const { createInvoice, updateInvoice, loading, error } = useInvoiceActions();

  const [form, setForm] = useState(() => {
    if (invoice) {
      return {
        ...DEFAULT_FORM,
        ...invoice,
        schema: invoice.schema?.id || invoice.schema,
        line_items: invoice.line_items?.length
          ? invoice.line_items.map((li) => ({
              description: li.description,
              hsn_sac_code: li.hsn_sac_code || '',
              quantity: li.quantity,
              unit_price: li.unit_price,
              gst_rate: li.gst_rate,
              order: li.order,
            }))
          : [EMPTY_ITEM()],
      };
    }
    return DEFAULT_FORM;
  });

  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Live GST calculation
  const { totals } = useGSTCalculator(form.line_items, form.supply_type, form.discount_amount);

  // Auto-select domain when schemas load
  useEffect(() => {
    if (!form.domain && schemas.length > 0) {
      const first = schemas[0];
      setForm((f) => ({ ...f, domain: first.domain, schema: first.id }));
    }
  }, [schemas]);

  const selectedSchema = schemas.find((s) => s.domain === form.domain);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleDomainChange = (e) => {
    const schema = schemas.find((s) => s.domain === e.target.value);
    setForm((f) => ({
      ...f,
      domain: e.target.value,
      schema: schema?.id || '',
      extra_data: {},
    }));
  };

  const handleExtraDataChange = (name, value) => {
    setForm((f) => ({ ...f, extra_data: { ...f.extra_data, [name]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    const payload = {
      ...form,
      line_items: form.line_items.map((li, idx) => ({ ...li, order: idx })),
    };

    const result = isEdit
      ? await updateInvoice(invoice.id, payload)
      : await createInvoice(payload);

    if (result.success) {
      if (onSuccess) {
        onSuccess(result.data);
      } else {
        navigate('/invoices');
      }
    } else {
      setSubmitError(result.message);
      if (result.errors) setFieldErrors(result.errors);
    }
  };

  if (schemasLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ---- Global error ---- */}
      {submitError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {submitError}
        </div>
      )}

      {/* ---- Domain Selector ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Invoice Domain</h2>
        <div>
          <label className="text-xs font-medium text-white/60 block mb-1.5 uppercase tracking-wider">
            Domain *
          </label>
          <select
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
            value={form.domain}
            onChange={handleDomainChange}
            required
          >
            <option value="" disabled className="bg-gray-900">Select domain…</option>
            {schemas.map((s) => (
              <option key={s.domain} value={s.domain} className="bg-gray-900">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---- Client Info ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Client Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Client Name *"
            type="text"
            placeholder="Full name or company"
            value={form.client_name}
            onChange={(e) => set('client_name', e.target.value)}
            required
          />
          <Input
            label="Client Email"
            type="email"
            placeholder="client@email.com"
            value={form.client_email}
            onChange={(e) => set('client_email', e.target.value)}
          />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/60 block mb-1.5 uppercase tracking-wider">
              Client Address
            </label>
            <textarea
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none"
              rows={2}
              placeholder="Street, City, State, PIN"
              value={form.client_address}
              onChange={(e) => set('client_address', e.target.value)}
            />
          </div>
          <Input
            label="Client GSTIN"
            type="text"
            placeholder="22AAAAA0000A1Z5"
            value={form.client_gstin}
            onChange={(e) => set('client_gstin', e.target.value.toUpperCase())}
          />
          <Input
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={(e) => set('due_date', e.target.value)}
          />
        </div>
      </div>

      {/* ---- GST Settings ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">GST Settings</h2>
        <SupplyTypeSelector
          value={form.supply_type}
          onChange={(v) => set('supply_type', v)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Input
            label="Place of Supply"
            type="text"
            placeholder="Kerala / KL"
            value={form.place_of_supply}
            onChange={(e) => set('place_of_supply', e.target.value)}
          />
          <Input
            label="Discount Amount (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.discount_amount}
            onChange={(e) => set('discount_amount', e.target.value)}
          />
        </div>
      </div>

      {/* ---- Domain Extra Fields ---- */}
      {selectedSchema?.extra_fields?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <DynamicFields
            extraFields={selectedSchema.extra_fields}
            values={form.extra_data}
            onChange={handleExtraDataChange}
          />
        </div>
      )}

      {/* ---- Line Items ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <LineItemsTable
          items={form.line_items}
          onChange={(items) => set('line_items', items)}
          supplyType={form.supply_type}
        />
        {fieldErrors.line_items && (
          <p className="mt-2 text-xs text-red-400">{fieldErrors.line_items}</p>
        )}
      </div>

      {/* ---- GST Summary ---- */}
      <GSTSummary totals={totals} supplyType={form.supply_type} currency={form.currency} />

      {/* ---- Notes ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-2">
        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
          Notes (optional)
        </label>
        <textarea
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none"
          rows={3}
          placeholder="Any additional notes for the admin…"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      {/* ---- Actions ---- */}
      <div className="flex gap-3">
        <Button variant="primary" type="submit" disabled={loading} className="flex-1 py-3">
          {loading ? 'Saving…' : isEdit ? 'Update Invoice' : 'Save as Draft'}
        </Button>
        <Button
          variant="secondary"
          type="button"
          className="flex-1 py-3"
          onClick={() => navigate('/invoices')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
