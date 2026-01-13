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
    groupId?: string;
    nextDate?: string;
    nextSendDate?: string;
    isActive?: boolean;
    customVariables?: Record<string, string>;
  } | null;
  onClose: () => void;
  defaultGroupId?: string;
}

export default function SubscriberModal({ subscriber, onClose, defaultGroupId }: SubscriberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    groupId: defaultGroupId || "",
    nextDate: "",
    nextSendDate: "",
    isActive: true,
    customVariables: {} as Record<string, string>,
  });
  const [groups, setGroups] = useState<Array<{_id: string; name: string}>>([]);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{message: string; type: "success" | "error"} | null>(null);

  useEffect(() => {
    fetchGroups();
    if (subscriber) {
      // Handle groupId - it might be a string ID or a populated object
      const extractedGroupId = typeof subscriber.groupId === 'string' 
        ? subscriber.groupId 
        : (subscriber.groupId as any)?._id || defaultGroupId || "";
      
      setFormData({
        name: subscriber.name,
        email: subscriber.email,
        service: subscriber.service,
        groupId: extractedGroupId,
        nextDate: subscriber.nextDate ? new Date(subscriber.nextDate).toISOString().split('T')[0] : "",
        nextSendDate: subscriber.nextSendDate ? new Date(subscriber.nextSendDate).toISOString().split('T')[0] : "",
        isActive: subscriber.isActive !== undefined ? subscriber.isActive : true,
        customVariables: subscriber.customVariables || {},
      });
    }
  }, [subscriber, defaultGroupId]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

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
        // Handle error - convert object to string if needed
        if (typeof responseData.error === 'string') {
          setError(responseData.error);
        } else if (responseData.error && responseData.error.message) {
          setError(responseData.error.message);
        } else if (responseData.message) {
          setError(responseData.message);
        } else {
          setError("Failed to save subscriber");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {subscriber ? "Edit Subscriber" : "Add Subscriber"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="label">Group (Optional)</label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="input"
            >
              <option value="">No group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Assign to a group for organized email campaigns
            </p>
          </div>

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
            <label className="label">Service Renewal Date (Optional)</label>
            <input
              type="date"
              value={formData.nextDate}
              onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
              className="input"
            />
            <p className="mt-1 text-xs text-gray-500">
              When their service renews (e.g., Netflix subscription date). Use {`{{nextDate}}`} in templates.
            </p>
          </div>

          <div className="mb-4">
            <label className="label">First Email Send Date (Optional)</label>
            <input
              type="date"
              value={formData.nextSendDate}
              onChange={(e) => setFormData({ ...formData, nextSendDate: e.target.value })}
              className="input"
            />
            <p className="mt-1 text-xs text-gray-500">
              When to send the first reminder email. Leave empty to use Service Renewal Date.
            </p>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (will receive emails)
            </label>
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
        </form>

        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl sticky bottom-0">
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
            onClick={handleSubmit}
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? "Saving..." : subscriber ? "Update" : "Add"}
          </button>
        </div>
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
