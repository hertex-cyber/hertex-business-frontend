import React, { useRef, useState } from 'react';

/**
 * Reusable image upload field with live preview, file size hint, and remove action.
 *
 * @param {string}   label        - field label text
 * @param {string}   hint         - dimension recommendation
 * @param {string}   currentUrl   - URL of currently saved image
 * @param {Function} onUpload     - (file: File) => Promise<{ success, message }>
 * @param {Function} onRemove     - () => Promise<{ success }>
 * @param {boolean}  showWarning  - show "appears on all invoices" warning
 */
const ImageUploadField = ({ label, hint, currentUrl, onUpload, onRemove, showWarning }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setMessage('');
    const result = await onUpload(file);
    setUploading(false);

    if (result.success) {
      setMessage(result.message || 'Uploaded successfully.');
      setMessageType('success');
      setPreview(null); // will show the new currentUrl on next render
    } else {
      setMessage(result.message || 'Upload failed.');
      setMessageType('error');
      setPreview(null);
    }
    // Reset file input
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async () => {
    setUploading(true);
    const result = await onRemove();
    setUploading(false);
    if (result.success) {
      setMessage('Removed.');
      setMessageType('success');
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">{label}</h4>
          {hint && <p className="text-xs text-white/30 mt-0.5">{hint}</p>}
          {showWarning && (
            <p className="text-xs text-yellow-400/70 mt-1">
              ⚠ This image appears on all approved invoices.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] transition-all disabled:opacity-40"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {displayUrl ? (
        <div className="flex items-center justify-center bg-white/[0.02] rounded-lg p-3 h-24">
          <img
            src={displayUrl}
            alt={label}
            className="max-h-20 max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-lg h-24 text-white/20 text-xs">
          No image uploaded
        </div>
      )}

      {/* Feedback */}
      {message && (
        <p className={`text-xs ${messageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploadField;
