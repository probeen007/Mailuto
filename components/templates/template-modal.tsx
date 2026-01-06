"use client";

import { useState, useEffect } from "react";
import { X, Eye, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Toast from "@/components/ui/toast";
import { replaceTemplateVariables } from "@/lib/template-utils";

interface TemplateModalProps {
  template?: {
    _id: string;
    name: string;
    subject: string;
    body: string;
  } | null;
  onClose: () => void;
}

export default function TemplateModal({ template, onClose }: TemplateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customVars, setCustomVars] = useState<Set<string>>(new Set());
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscribersLoaded, setSubscribersLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
      });
    }
    fetchCustomVariables();
  }, [template]);

  const fetchCustomVariables = async () => {
    try {
      const res = await fetch("/api/subscribers");
      if (res.ok) {
        const fetchedSubscribers = await res.json();
        setSubscribers(fetchedSubscribers);
        setSubscribersLoaded(true);
        const allCustomVars = new Set<string>();
        fetchedSubscribers.forEach((sub: any) => {
          if (sub.customVariables) {
            Object.keys(sub.customVariables).forEach(key => {
              allCustomVars.add(key);
            });
          }
        });
        setCustomVars(allCustomVars);
      } else {
        setSubscribersLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch custom variables:", error);
      setSubscribersLoaded(true);
    }
  };

  const getSampleData = () => {
    // Use real subscriber data if available, otherwise use dummy data
    if (subscribers.length > 0) {
      const subscriber = subscribers[0]; // Use first subscriber's data
      const sampleData: Record<string, string> = {
        name: subscriber.name || "N/A",
        service: subscriber.service || "N/A",
        nextDate: subscriber.nextDate 
          ? new Date(subscriber.nextDate).toLocaleDateString() 
          : "N/A",
      };
      
      // Add custom variables if they exist
      if (subscriber.customVariables && typeof subscriber.customVariables === 'object') {
        Object.keys(subscriber.customVariables).forEach(key => {
          sampleData[key] = subscriber.customVariables[key];
        });
      }
      
      return sampleData;
    }
    
    // Fallback to dummy data when no subscribers exist
    const sampleData: Record<string, string> = {
      name: "John Doe",
      service: "Premium Plan",
      nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
    customVars.forEach(varName => {
      sampleData[varName] = `Sample ${varName}`;
    });
    return sampleData;
  };

  const getPreviewContent = () => {
    const sampleData = getSampleData();
    return {
      subject: replaceTemplateVariables(formData.subject, sampleData),
      body: replaceTemplateVariables(formData.body, sampleData),
    };
  };

  const highlightVariables = (text: string) => {
    // Match {{variable}} with optional whitespace
    const parts = text.split(/(\{\{\s*\w+\s*\}\})/g);
    return parts.map((part, i) => {
      if (part.match(/\{\{\s*\w+\s*\}\}/)) {
        const varName = part.replace(/\{\{\s*(\w+)\s*\}\}/, '$1');
        const isCustom = customVars.has(varName);
        const isDefault = ['name', 'service', 'nextDate'].includes(varName);
        return (
          <span
            key={i}
            className={`px-1.5 py-0.5 rounded font-mono text-xs font-semibold ${
              isDefault ? 'bg-blue-100 text-blue-700' : isCustom ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleTestSend = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setSendingTest(true);
    try {
      const res = await fetch('/api/test-send-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          subject: formData.subject,
          body: formData.body,
          isBlockBased: false,
        }),
      });

      if (res.ok) {
        showToast('Test email sent successfully!', 'success');
        setTestEmail('');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to send test email', 'error');
      }
    } catch (err) {
      showToast('An error occurred while sending test email', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = template
        ? `/api/templates/${template._id}`
        : "/api/templates";
      const method = template ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save template");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {template ? "Edit Template" : "Create Template"}
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

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">Available Variables:</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-blue-800 mb-1">Default Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {["{{name}}", "{{service}}", "{{nextDate}}"].map((variable) => (
                    <code key={variable} className="bg-white px-2 py-1 rounded text-xs text-blue-700 font-mono border border-blue-300">
                      {variable}
                    </code>
                  ))}
                </div>
              </div>
              {customVars.size > 0 && (
                <div>
                  <p className="text-xs text-blue-800 mb-1">Custom Variables (from subscribers):</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(customVars).map((variable) => (
                      <code key={variable} className="bg-white px-2 py-1 rounded text-xs text-green-700 font-mono border border-green-300">
                        {`{{${variable}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Note: Custom variables are subscriber-specific. Add them in the subscriber form.
            </p>
          </div>

          <div className="mb-4">
            <label className="label">Template Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Monthly Reminder"
            />
          </div>

          <div className="mb-4">
            <label className="label">Email Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input"
              placeholder="Your {{service}} renewal is coming up"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="label">Email Body</label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {!showPreview ? (
              <textarea
                required
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="input min-h-[200px] resize-y"
                placeholder="Hi {{name}},&#10;&#10;This is a friendly reminder that your {{service}} subscription is due for renewal on {{nextDate}}.&#10;&#10;Best regards"
              />
            ) : !subscribersLoaded ? (
              <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-500">Loading preview...</p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50">
                <div className="mb-3 pb-3 border-b border-gray-300">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Subject Preview:</p>
                  <p className="text-sm text-gray-900">{getPreviewContent().subject}</p>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600">Body Preview:</p>
                  <p className="text-xs text-gray-500">
                    {subscribers.length > 0 ? `Using data from: ${subscribers[0].name}` : 'Using dummy data (no subscribers)'}
                  </p>
                </div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {getPreviewContent().body}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Send className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Test Email</h3>
            </div>
            <p className="text-sm text-purple-700 mb-3">Send a test email to yourself with sample data</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={handleTestSend}
                disabled={sendingTest || !testEmail}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingTest ? 'Sending...' : 'Send'}
              </button>
            </div>
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
              {loading ? "Saving..." : template ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
