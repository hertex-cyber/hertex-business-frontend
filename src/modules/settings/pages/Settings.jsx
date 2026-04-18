import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCompanyProfile } from '../../invoice/hooks/useCompanyProfile';
import ImageUploadField from '../../invoice/components/AdminPanel/CompanyProfile/ImageUploadField';

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = ['Superadmin', 'Admin'].includes(user?.role) || user?.is_superuser;
  const { profile, loading, uploadAsset, removeAsset } = useCompanyProfile();

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Preferences</h1>
          <p className="text-white/40 text-sm mt-1">Manage your account and application settings.</p>
        </div>

        {isAdmin && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Invoice Branding</h2>
              <p className="text-xs text-white/30 mt-1">Branding assets are embedded in approved invoice PDFs.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white">Digital Signature</h4>
                <p className="text-xs text-white/35 mt-0.5">Printed in the authorised signatory block of each invoice</p>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-xs text-white/40">Loading...</span>
                </div>
              ) : !profile ? (
                <p className="text-xs text-white/30 py-4">
                  Set up a Company Profile first before uploading a signature.
                </p>
              ) : (
                <ImageUploadField
                  label="Signature"
                  hint="Recommended: 150×60 px, transparent PNG · Max 500 KB"
                  currentUrl={profile?.signature_url}
                  onUpload={(file) => uploadAsset('signature', file)}
                  onRemove={() => removeAsset('signature')}
                  showWarning={false}
                />
              )}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-white/30 text-sm">No preferences available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
