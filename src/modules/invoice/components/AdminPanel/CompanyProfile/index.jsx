import React, { useState } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import BrandingUpload from './BrandingUpload';
import { useCompanyProfile } from '../../../hooks/useCompanyProfile';

const TABS = ['Company Info', 'Bank Details', 'Branding'];

/**
 * Admin company profile page with three tabs:
 * Company Info | Bank Details | Branding (logo, signature, seal)
 */
const CompanyProfileAdmin = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { profile, loading, error, updateProfile, uploadAsset, removeAsset } = useCompanyProfile();

  const [form, setForm] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Sync form with loaded profile
  React.useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaveStatus('');
    const result = await updateProfile(form);
    setSaveStatus(result.success ? 'Saved successfully.' : result.message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Company Profile</h1>
        <p className="text-white/40 text-sm mt-1">
          Branding assets here are embedded in all approved invoice PDFs.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === idx
                ? 'text-white border-b-2 border-white -mb-px'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {!form && !profile && (
        <div className="text-center py-10 text-white/30 text-sm">
          No company profile yet. Fill in the form below to create one.
        </div>
      )}

      {/* Tab panels */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Company Name *"
                type="text"
                value={form?.company_name || ''}
                onChange={(e) => set('company_name', e.target.value)}
                placeholder="Bytehive Digitals Pvt Ltd"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-white/60 block mb-1.5 uppercase tracking-wider">
                Company Address *
              </label>
              <textarea
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none"
                rows={3}
                placeholder="Street, City, State, PIN"
                value={form?.company_address || ''}
                onChange={(e) => set('company_address', e.target.value)}
              />
            </div>
            <Input label="GSTIN *" type="text" value={form?.gstin || ''} onChange={(e) => set('gstin', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" />
            <Input label="PAN Number" type="text" value={form?.pan_number || ''} onChange={(e) => set('pan_number', e.target.value.toUpperCase())} placeholder="AAAAA0000A" />
            <Input label="Phone" type="tel" value={form?.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            <Input label="Email" type="email" value={form?.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="billing@company.com" />
            <Input label="Website" type="url" value={form?.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="https://company.com" />
            <Input label="State" type="text" value={form?.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="Kerala" />
            <Input label="State Code" type="text" value={form?.state_code || ''} onChange={(e) => set('state_code', e.target.value)} placeholder="32" />
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Bank Name" type="text" value={form?.bank_name || ''} onChange={(e) => set('bank_name', e.target.value)} placeholder="HDFC Bank" />
            <Input label="Account Number" type="text" value={form?.bank_account || ''} onChange={(e) => set('bank_account', e.target.value)} placeholder="00000000000000" />
            <Input label="IFSC Code" type="text" value={form?.bank_ifsc || ''} onChange={(e) => set('bank_ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" />
            <Input label="Branch" type="text" value={form?.bank_branch || ''} onChange={(e) => set('bank_branch', e.target.value)} placeholder="Ernakulam Main" />
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <BrandingUpload
          profile={profile}
          uploadAsset={uploadAsset}
          removeAsset={removeAsset}
        />
      )}

      {/* Save button (not shown on Branding tab — handled per-field) */}
      {activeTab !== 2 && (
        <div className="space-y-2">
          {saveStatus && (
            <p className={`text-xs ${saveStatus.includes('success') || saveStatus === 'Saved successfully.' ? 'text-green-400' : 'text-red-400'}`}>
              {saveStatus}
            </p>
          )}
          <Button variant="primary" onClick={handleSave} className="py-2.5">
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompanyProfileAdmin;
