import { useState, useEffect, useCallback } from 'react';
import { mediaApi } from '../api/mediaApi';

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export function useMediaCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await mediaApi.collections.list();
      setCollections(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Sort helper: pinned first, then alphabetical
  const sortCollections = (cols) =>
    [...cols].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const createCollection = async (data) => {
    const res = await mediaApi.collections.create(data);
    setCollections((prev) => sortCollections([...prev, res.data.data]));
    return res.data.data;
  };

  const updateCollection = async (id, data) => {
    const res = await mediaApi.collections.patch(id, data);
    setCollections((prev) => sortCollections(prev.map((c) => (c.id === id ? res.data.data : c))));
    return res.data.data;
  };

  const deleteCollection = async (id) => {
    await mediaApi.collections.remove(id);
    setCollections((prev) => sortCollections(prev.filter((c) => c.id !== id)));
  };

  return {
    collections,
    loading,
    error,
    refresh: fetch,
    createCollection,
    updateCollection,
    deleteCollection,
  };
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export function useMediaAssets(collectionId) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!collectionId) {
      setAssets([]);
      return;
    }
    try {
      setLoading(true);
      const res = await mediaApi.assets.list({ collection_id: collectionId });
      const body = res.data.data || {};
      setAssets(body.results || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const uploadAsset = async (file, colId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection_id', colId);
    const res = await mediaApi.assets.upload(formData);
    setAssets((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const deleteAsset = async (id) => {
    await mediaApi.assets.remove(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    assets,
    loading,
    error,
    refresh: fetch,
    uploadAsset,
    deleteAsset,
  };
}
