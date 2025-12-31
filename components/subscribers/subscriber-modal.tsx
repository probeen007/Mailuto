"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Toast from "@/components/ui/toast";

interface SubscriberModalProps {
  subscriber?: {
    _id: string;
    name: string;
    email: string;
    service: string;
    nextDate?: string;
    customVariables?: Record<string, string>;
  } | null;
  onClose: () => void;
}

export default function SubscriberModal({ subscriber, onClose }: SubscriberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    nextDate: "",
    customVariables: {} as Record<string, string>,
  });
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{message: string; type: "success" | "error"} | null>(null);

  useEffect(() => {
    if (subscriber) {
      setFormData({
        name: subscriber.name,
        email: subscriber.email,
        service: subscriber.service,
        nextDate: subscriber.nextDate ? new Date(subscriber.nextDate).toISOString().split('T')[0] : "",
        customVariables: subscriber.customVariables || {},
      });
    }
  }, [subscriber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = subscriber
        ? `/api/subscribers/${subscriber._id}`
        : "/api/subscribers";
      const method = subscriber ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();

      if (res.ok) {
        setToast({ message: subscriber ? "Subscriber updated successfully!" : "Subscriber added successfully!", type: "success" });
        setTimeout(onClose, 1500);
      } else {
        setError(responseData.error || "Failed to save subscriber");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {subscriber ? "Edit Subscriber" : "Add Subscriber"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="label">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="John Doe"
            />
          </div>

          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="john@example.com"
            />
          </div>

          <div className="mb-4">
            <label className="label">Service</label>
            <input
              type="text"
              required
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="input"
              placeholder="Netflix Premium"
            />
            <p className="mt-1 text-xs text-gray-500">
              e.g., Netflix Premium, Rent Payment, Web Hosting
            </p>
          </div>

          <div className="mb-4">
            <label className="label">Next Renewal Date (Optional)</label>
            <input
              type="date"
              value={formData.nextDate}
              onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
              className="input"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use {`{{nextDate}}`} in templates
            </p>
          </div>

          <div className="mb-6">
            <label className="label">Custom Variables (Optional)</label>
            <div className="space-y-2 mb-2">
              {Object.entries(formData.customVariables).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-mono text-gray-700">{`{{${key}}}`}</span>
                  <span className="text-sm text-gray-600 flex-1">{value}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...formData.customVariables };
                      delete updated[key];
                      setFormData({ ...formData, customVariables: updated });
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="input flex-1"
                placeholder="Variable name (e.g., amount)"
              />
              <input
                type="text"
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                className="input flex-1"
                placeholder="Value"
              />
              <button
                type="button"
                onClick={() => {
                  if (newVarKey && newVarValue) {
                    const updated = { ...formData.customVariables, [newVarKey]: newVarValue };
                    setFormData({
                      ...formData,
                      customVariables: updated,
                    });
                    setNewVarKey("");
                    setNewVarValue("");
                  }
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
              >
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Add custom variables to use in templates like {`{{variableName}}`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Saving..." : subscriber ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
