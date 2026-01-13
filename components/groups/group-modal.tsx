"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface GroupModalProps {
  group?: {
    _id: string;
    name: string;
    templateId: { _id: string; name: string };
    intervalDays: number;
    isActive: boolean;
  } | null;
  onClose: () => void;
}

interface Template {
  _id: string;
  name: string;
  subject: string;
  isBlockBased?: boolean;
}

export default function GroupModal({ group, onClose }: GroupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    templateId: "",
    intervalDays: 30,
    isActive: true,
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTemplates();
    if (group) {
      setFormData({
        name: group.name,
        templateId: group.templateId._id,
        intervalDays: group.intervalDays,
        isActive: group.isActive,
      });
    }
  }, [group]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = group ? `/api/groups/${group._id}` : '/api/groups';
      const method = group ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onClose();
      } else {
        const data = await res.json();
        // Handle error - convert object to string if needed
        if (typeof data.error === 'string') {
          setError(data.error);
        } else if (data.error && data.error.message) {
          setError(data.error.message);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError('Failed to save group');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {group ? 'Edit Group' : 'Create Group'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="label">Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
              placeholder="e.g., Premium Renewals"
            />
          </div>

          <div>
            <label className="label">Template *</label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} {template.isBlockBased && '(Block)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Send Interval (days) *</label>
            <input
              type="number"
              min="1"
              value={formData.intervalDays}
              onChange={(e) =>
                setFormData({ ...formData, intervalDays: parseInt(e.target.value) })
              }
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              How often to send emails (30 = monthly)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (emails will be sent)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary" disabled={loading}>
              {loading ? 'Saving...' : group ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
