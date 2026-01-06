"use client";

import { useState, useEffect } from "react";
import { X, Layers, Send } from "lucide-react";
import BlockEditor from "./block-editor";
import BlockPreview from "./block-preview";
import type { EmailBlock } from "@/types/email-blocks";
import { useToast } from "@/hooks/use-toast";

interface BlockTemplateModalProps {
  template?: {
    _id: string;
    name: string;
    subject: string;
    blocks?: EmailBlock[];
  } | null;
  onClose: () => void;
}

export default function BlockTemplateModal({ template, onClose }: BlockTemplateModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
  });
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
      });
      setBlocks(template.blocks || []);
    }
  }, [template]);

  const handleTestSend = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (blocks.length === 0) {
      showToast('Please add at least one block to send a test', 'error');
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
          blocks,
          isBlockBased: true,
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

    if (blocks.length === 0) {
      setError("Please add at least one block to your template");
      setLoading(false);
      return;
    }

    try {
      const url = template ? `/api/templates/${template._id}` : "/api/templates";
      const method = template ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          blocks,
          isBlockBased: true,
        }),
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {template ? "Edit" : "Create"} Block Template
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="label">Template Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Monthly Reminder"
                  />
                </div>

                <div>
                  <label className="label">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input"
                    placeholder="e.g., Reminder: {{service}} renewal on {{date}}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports variables: {"{{name}}, {{email}}, {{service}}, {{date}}"}
                  </p>
                </div>
              </div>

              {/* Two Column Layout: Editor and Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Block Editor */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Email Content</h3>
                  <BlockEditor blocks={blocks} onChange={setBlocks} />
                </div>

                {/* Preview */}
                <div className="lg:sticky lg:top-6">
                  <BlockPreview blocks={blocks} subject={formData.subject} />
                </div>
              </div>

              {/* Test Email Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
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
                    disabled={sendingTest || !testEmail || blocks.length === 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingTest ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || blocks.length === 0}
              >
                {loading ? "Saving..." : template ? "Update Template" : "Create Template"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
