/**
 * Admin Menu Form Page
 * Create or edit menus (system and custom)
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { getAvailableIcons } from "@/utils/iconMapper";

export default function AdminMenuForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    href: "",
    icon: "LayoutDashboard",
    section: "Operations",
    order: 0,
    description: "",
    is_active: true,
    type: "CUSTOM", // Default to CUSTOM unless user is superadmin
    organization: null,
    required_product: null,
  });

  // Fetch menu if editing
  useEffect(() => {
    if (id) {
      const fetchMenu = async () => {
        try {
          const response = await axios.get(`/api/menus/${id}/`);
          if (response.data && !response.data.error) {
            setFormData(response.data.data || response.data);
          }
        } catch (err) {
          setError("Failed to load menu");
        } finally {
          setLoading(false);
        }
      };
      fetchMenu();
    }
  }, [id]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products/");
        if (response.data && response.data.results) {
          setProducts(response.data.results || []);
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "order"
            ? parseInt(value)
            : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = {
        code: formData.code,
        name: formData.name,
        href: formData.href,
        icon: formData.icon,
        section: formData.section,
        order: formData.order,
        description: formData.description,
        is_active: formData.is_active,
        organization: formData.organization,
        required_product: formData.required_product,
      };

      if (user?.role === "Superadmin") {
        data.type = formData.type;
      }

      const response = id
        ? await axios.patch(`/api/menus/${id}/`, data)
        : await axios.post("/api/menus/", data);

      if (response.status === 200 || response.status === 201 || response.data?.success) {
        navigate("/admin/menus");
      } else {
        setError(response.data?.error || "Failed to save menu");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to save menu",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="text-white/40 animate-spin" size={32} />
      </div>
    );
  }

  const availableIcons = getAvailableIcons();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/admin/menus")}
            className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to Menus
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {id ? "Edit Menu" : "Create Menu"}
          </h1>
          <p className="text-sm text-white/40 font-medium">
            {id
              ? "Update menu details and settings"
              : "Create a new system or custom menu"}
          </p>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-10 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code & Name */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., dashboard, crm"
                required
                disabled={!!id}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
              />
              <p className="text-xs text-white/40 mt-1">
                Unique identifier (cannot change)
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Dashboard"
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Href */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              URL Path *
            </label>
            <input
              type="text"
              name="href"
              value={formData.href}
              onChange={handleChange}
              placeholder="e.g., /dashboard"
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <p className="text-xs text-white/40 mt-1">Must start with /</p>
          </div>

          {/* Icon & Section */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Icon *
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Select an icon...</option>
                {availableIcons.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Section *
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="e.g., Operations"
                required
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Order & Type */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-xs text-white/40 mt-1">
                Sort order within section
              </p>
            </div>

            {user?.role === "Superadmin" && (
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={!!id}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                >
                  <option value="SYSTEM">System</option>
                  <option value="CUSTOM">Custom</option>
                </select>
                <p className="text-xs text-white/40 mt-1">
                  {id && "Cannot change after creation"}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description..."
              rows="3"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Required Product */}
          {formData.type === "CUSTOM" && user?.role === "Superadmin" && (
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Required Product (Optional)
              </label>
              <select
                name="required_product"
                value={formData.required_product || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">None - Available to all</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/40 mt-1">
                Menu only visible if org has purchased this product
              </p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-white/10 border border-white/20 accent-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-white">
              Active
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader size={16} className="inline animate-spin mr-2" />
                  Saving...
                </>
              ) : id ? (
                "Update Menu"
              ) : (
                "Create Menu"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/menus")}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
