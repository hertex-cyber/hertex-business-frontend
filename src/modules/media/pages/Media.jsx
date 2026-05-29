import React, { useState, useCallback } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Upload,
  Loader2,
  FolderOpen,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import Button from '@/components/Button';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import CollectionList from '../components/CollectionList';
import AssetCard from '../components/AssetCard';
import CreateCollectionDialog from '../components/CreateCollectionDialog';
import UploadAssetDialog from '../components/UploadAssetDialog';
import AssetPreviewDialog from '../components/AssetPreviewDialog';
import { useMediaCollections, useMediaAssets } from '../hooks/useMedia';

const FILTER_OPTIONS = [
  { value: '', label: 'All', icon: null },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'document', label: 'Documents' },
  { value: 'audio', label: 'Audio' },
];

const Media = () => {
  // Collections
  const {
    collections,
    loading: loadingCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    refresh: refreshCollections,
  } = useMediaCollections();

  // Active collection
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  // Assets
  const {
    assets,
    loading: loadingAssets,
    uploadAsset,
    deleteAsset,
    refresh: refreshAssets,
  } = useMediaAssets(activeCollectionId);

  // UI state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  // Delete confirmation state
  const [deleteCollectionTarget, setDeleteCollectionTarget] = useState(null);
  const [deleteAssetTarget, setDeleteAssetTarget] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Multi-selection
  const [selectedAssetIds, setSelectedAssetIds] = useState(new Set());

  // Filter assets
  const filteredAssets = assets.filter((a) => {
    if (filterType && a.file_type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.file_name.toLowerCase().includes(q);
    }
    return true;
  });

  // Handlers
  const handleCreateCollection = useCallback(
    async (data) => {
      const col = await createCollection(data);
      setActiveCollectionId(col.id);
    },
    [createCollection],
  );

  const handleRenameCollection = useCallback(
    async (data) => {
      await updateCollection(editingCollection.id, data);
      setEditingCollection(null);
    },
    [editingCollection, updateCollection],
  );

  const handleDeleteCollection = useCallback(
    async (col) => {
      // Prevent deletion if collection still has assets
      if (col.asset_count > 0) {
        setDeleteCollectionTarget({
          ...col,
          _blocked: true,
          title: `Can't delete "${col.name}"`,
          description: `This collection still has ${col.asset_count} asset(s). Remove all assets before deleting the collection.`,
        });
        return;
      }
      // Empty collection — confirm deletion
      setDeleteCollectionTarget({
        ...col,
        _blocked: false,
        title: `Delete "${col.name}"?`,
        description: 'This action cannot be undone. The collection will be permanently removed.',
      });
    },
    [],
  );

  const confirmDeleteCollection = useCallback(async () => {
    if (!deleteCollectionTarget) return;
    try {
      setIsDeleting(true);
      await deleteCollection(deleteCollectionTarget.id);
      if (activeCollectionId === deleteCollectionTarget.id) {
        setActiveCollectionId(null);
      }
      setDeleteCollectionTarget(null);
    } catch {
      // error handled by hook
    } finally {
      setIsDeleting(false);
    }
  }, [deleteCollection, deleteCollectionTarget, activeCollectionId]);

  const handleUpload = useCallback(
    async (file) => {
      await uploadAsset(file, activeCollectionId);
      refreshCollections();
    },
    [uploadAsset, activeCollectionId, refreshCollections],
  );

  const handleDeleteAsset = useCallback(
    async (asset) => {
      setDeleteAssetTarget(asset);
    },
    [],
  );

  const confirmDeleteAsset = useCallback(async () => {
    if (!deleteAssetTarget) return;
    try {
      setIsDeleting(true);
      await deleteAsset(deleteAssetTarget.id);
      refreshCollections();
      setDeleteAssetTarget(null);
    } catch {
      // error handled by hook
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAsset, deleteAssetTarget, refreshCollections]);

  // ---- Multi-selection handlers ----
  const toggleAssetSelection = useCallback((id) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedAssetIds((prev) => {
      if (prev.size === filteredAssets.length && filteredAssets.length > 0) {
        return new Set();
      }
      return new Set(filteredAssets.map((a) => a.id));
    });
  }, [filteredAssets]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedAssetIds.size === 0) return;
    try {
      setIsDeleting(true);
      for (const id of selectedAssetIds) {
        await deleteAsset(id);
      }
      refreshCollections();
      setSelectedAssetIds(new Set());
      setShowBulkDeleteConfirm(false);
    } catch {
      // error handled by hook
    } finally {
      setIsDeleting(false);
    }
  }, [selectedAssetIds, deleteAsset, refreshCollections]);

  // Clear selection when switching collections
  const handleSelectCollection = useCallback((id) => {
    setActiveCollectionId(id);
    setSelectedAssetIds(new Set());
  }, []);

  // Counts for the filter tabs
  const typeCounts = assets.reduce(
    (acc, a) => {
      acc[a.file_type] = (acc[a.file_type] || 0) + 1;
      acc['total'] = (acc['total'] || 0) + 1;
      return acc;
    },
    { total: 0 },
  );

  return (
    <div className="flex flex-col h-full">
      {/* ================================================================ */}
      {/* Header */}
      {/* ================================================================ */}
      <header className="px-10 py-6 flex justify-between items-end border-b border-white/5 relative z-20 shrink-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <ImageIcon size={10} />
            Digital Asset Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Media</h1>
          <p className="text-sm text-white/40 font-medium">
            {activeCollection
              ? `Browsing "${activeCollection.name}" — ${assets.length} asset${assets.length !== 1 ? 's' : ''}`
              : 'Select a collection to browse assets'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            className="w-auto px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            onClick={() => setShowUploadDialog(true)}
            disabled={!activeCollectionId}
          >
            <Upload size={14} className="mr-2" />
            Upload Asset
          </Button>
        </div>
      </header>

      {/* ================================================================ */}
      {/* Body: Sidebar + Main */}
      {/* ================================================================ */}
      <div className="flex flex-1 min-h-0">
        {/* ---- Sidebar: Collections ---- */}
        <aside className="w-64 border-r border-white/5 shrink-0 overflow-hidden">
          <CollectionList
            collections={collections}
            activeCollectionId={activeCollectionId}
            onSelect={handleSelectCollection}
            onCreate={() => setShowCreateDialog(true)}
            onRename={(col) => setEditingCollection(col)}
            onDelete={handleDeleteCollection}
            onTogglePin={(col) => updateCollection(col.id, { is_pinned: !col.is_pinned })}
            loading={loadingCollections}
          />
        </aside>

        {/* ---- Main: Asset Grid ---- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {!activeCollectionId ? (
            /* Empty state — no collection selected */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="p-4 rounded-full bg-white/5 inline-flex mb-4">
                  <FolderOpen size={32} className="text-white/15" />
                </div>
                <h3 className="text-lg font-bold text-white/60 mb-1">
                  Select a Collection
                </h3>
                <p className="text-sm text-white/30">
                  Choose a collection from the sidebar, or create a new one to get started.
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all"
                >
                  <Plus size={14} />
                  Create Collection
                </button>
              </div>
            </div>
          ) : loadingAssets ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="text-white/20 animate-spin" />
            </div>
          ) : (
            <div className="p-8 space-y-6">
              {/* ---- Search & Filter ---- */}
              <div className="flex items-center gap-4">
                {/* Select All checkbox */}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedAssetIds.size === filteredAssets.length && filteredAssets.length > 0}
                    onChange={toggleSelectAll}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selectedAssetIds.size === filteredAssets.length && filteredAssets.length > 0
                        ? 'bg-blue-500 border-blue-500'
                        : selectedAssetIds.size > 0
                          ? 'bg-blue-500/30 border-blue-400'
                          : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    {(selectedAssetIds.size === filteredAssets.length && filteredAssets.length > 0) && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {selectedAssetIds.size > 0 && selectedAssetIds.size < filteredAssets.length && (
                      <div className="w-2 h-0.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    Select
                  </span>
                </label>
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assets..."
                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterType(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                        filterType === opt.value
                          ? 'bg-white text-black shadow-lg'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                      {typeCounts[opt.value || 'total'] > 0 && (
                        <span
                          className={`ml-1.5 ${
                            filterType === opt.value
                              ? 'text-black/40'
                              : 'text-white/20'
                          }`}
                        >
                          {typeCounts[opt.value || 'total']}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---- Bulk Actions Toolbar ---- */}
              {selectedAssetIds.size > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CheckSquare size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {selectedAssetIds.size} selected
                      </p>
                      <p className="text-[10px] text-white/40">
                        {selectedAssetIds.size === filteredAssets.length
                          ? 'All assets selected'
                          : `${filteredAssets.length - selectedAssetIds.size} remaining`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAssetIds(new Set())}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={12} />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* ---- Asset Grid ---- */}
              {filteredAssets.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon size={40} className="mx-auto text-white/10 mb-3" />
                  <p className="text-sm font-bold text-white/40">
                    {searchQuery || filterType
                      ? 'No assets match your search'
                      : 'This collection is empty'}
                  </p>
                  <p className="text-xs text-white/20 mt-1">
                    {searchQuery || filterType
                      ? 'Try a different search or filter'
                      : 'Upload your first asset to get started'}
                  </p>
                  {!searchQuery && !filterType && (
                    <button
                      onClick={() => setShowUploadDialog(true)}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all"
                    >
                      <Upload size={14} />
                      Upload Asset
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      selected={selectedAssetIds.has(asset.id)}
                      onToggleSelect={toggleAssetSelection}
                      onPreview={setPreviewAsset}
                      onDelete={handleDeleteAsset}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================================================================ */}
      {/* Dialogs */}
      {/* ================================================================ */}

      {/* Create / Rename Collection */}
      <CreateCollectionDialog
        isOpen={showCreateDialog || !!editingCollection}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingCollection(null);
        }}
        onSave={editingCollection ? handleRenameCollection : handleCreateCollection}
        collection={editingCollection}
      />

      {/* Upload Assets */}
      <UploadAssetDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={handleUpload}
        collectionName={activeCollection?.name}
      />

      {/* Asset Preview */}
      <AssetPreviewDialog
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        asset={previewAsset}
        onDelete={handleDeleteAsset}
      />

      {/* ---- Collection Delete / Blocked Dialog ---- */}
      {deleteCollectionTarget?._blocked ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteCollectionTarget(null)} />
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <FolderOpen size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{deleteCollectionTarget.title}</h3>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">{deleteCollectionTarget.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() => setDeleteCollectionTarget(null)}
                className="px-4 py-2 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : deleteCollectionTarget ? (
        <ConfirmDeleteDialog
          isOpen={!!deleteCollectionTarget}
          onClose={() => setDeleteCollectionTarget(null)}
          onConfirm={confirmDeleteCollection}
          isDeleting={isDeleting}
          title={deleteCollectionTarget.title}
          description={deleteCollectionTarget.description}
        />
      ) : null}

      {/* ---- Delete Asset Confirmation ---- */}
      <ConfirmDeleteDialog
        isOpen={!!deleteAssetTarget}
        onClose={() => setDeleteAssetTarget(null)}
        onConfirm={confirmDeleteAsset}
        isDeleting={isDeleting}
        title={`Delete "${deleteAssetTarget?.file_name || ''}"?`}
        description="This action cannot be undone. The file will be permanently removed."
      />

      {/* ---- Bulk Delete Confirmation ---- */}
      <ConfirmDeleteDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
        title={`Delete ${selectedAssetIds.size} selected asset${selectedAssetIds.size !== 1 ? 's' : ''}?`}
        description={`This will permanently remove ${selectedAssetIds.size} asset${selectedAssetIds.size !== 1 ? 's' : ''}. This action cannot be undone.`}
      />
    </div>
  );
};

export default Media;
