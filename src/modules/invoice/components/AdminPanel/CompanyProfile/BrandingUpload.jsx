import React from 'react';
import ImageUploadField from './ImageUploadField';

/**
 * Branding tab — logo, digital signature, and company seal upload.
 */
const BrandingUpload = ({ profile, uploadAsset, removeAsset }) => {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Company Logo"
        hint="Recommended: 300×100 px, transparent PNG"
        currentUrl={profile?.logo_url}
        onUpload={(file) => uploadAsset('logo', file)}
        onRemove={() => removeAsset('logo')}
        showWarning={false}
      />

      <ImageUploadField
        label="Digital Signature"
        hint="Recommended: 150×60 px, transparent PNG"
        currentUrl={profile?.signature_url}
        onUpload={(file) => uploadAsset('signature', file)}
        onRemove={() => removeAsset('signature')}
        showWarning
      />

      <ImageUploadField
        label="Company Seal"
        hint="Recommended: 100×100 px, transparent PNG"
        currentUrl={profile?.seal_url}
        onUpload={(file) => uploadAsset('seal', file)}
        onRemove={() => removeAsset('seal')}
        showWarning
      />

      <p className="text-xs text-white/30">
        Max file size: 500 KB · Accepted formats: PNG, JPG
      </p>
    </div>
  );
};

export default BrandingUpload;
