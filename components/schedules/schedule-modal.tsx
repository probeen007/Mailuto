"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ScheduleModalProps {
  onClose: () => void;
}

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  service: string;
}

interface Template {
  _id: string;
  name: string;
}

export default function ScheduleModal({ onClose }: ScheduleModalProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formData, setFormData] = useState({
    subscriberId: "",
    templateId: "",
    scheduleType: "monthly" as "monthly" | "interval",
    dayOfMonth: 1,
    intervalDays: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subsRes, templatesRes] = await Promise.all([
        fetch("/api/subscribers"),
        fetch("/api/templates"),
      ]);

      if (subsRes.ok) setSubscribers(await subsRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.subscriberId || !formData.templateId) {
      setError("Please select both a subscriber and a template");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create schedule");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribers.length === 0 || templates.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Create Schedule</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {subscribers.length === 0 && templates.length === 0
                ? "You need to create at least one subscriber and one template before creating a schedule."
                : subscribers.length === 0
                ? "You need to create at least one subscriber before creating a schedule."
                : "You need to create at least one template before creating a schedule."}
            </p>
            <button onClick={onClose} className="btn btn-primary w-full">
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Schedule</h2>
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
            <label className="label">Subscriber</label>
            <select
              required
              value={formData.subscriberId}
              onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
              className="input"
            >
              <option value="">Select a subscriber</option>
              {subscribers.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name} - {sub.service}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="label">Email Template</label>
            <select
              required
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="input"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="label">Schedule Type</label>
            <select
              value={formData.scheduleType}
              onChange={(e) =>
                setFormData({ ...formData, scheduleType: e.target.value as "monthly" | "interval" })
              }
              className="input"
            >
              <option value="monthly">Monthly</option>
              <option value="interval">Every N Days</option>
            </select>
          </div>

          {formData.scheduleType === "monthly" ? (
            <div className="mb-6">
              <label className="label">Day of Month (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
                className="input"
              />
              <p className="mt-1 text-xs text-gray-500">
                Emails will be sent on day {formData.dayOfMonth} of each month at midnight (00:00 UTC)
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <label className="label">Interval (days)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.intervalDays}
                onChange={(e) => setFormData({ ...formData, intervalDays: parseInt(e.target.value) || 30 })}
                className="input"
              />
              <p className="mt-1 text-xs text-gray-500">
                Emails will be sent every {formData.intervalDays} days at midnight (00:00 UTC)
              </p>
            </div>
          )}

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
              {loading ? "Creating..." : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
