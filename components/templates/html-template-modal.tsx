"use client";

import { useState, useEffect } from "react";
import { X, Eye, Code, Sparkles, XCircle } from "lucide-react";
import Toast from "@/components/ui/toast";
import { replaceTemplateVariables } from "@/lib/template-utils";

interface HtmlTemplateModalProps {
  template?: {
    _id: string;
    name: string;
    subject: string;
    htmlBody?: string;
  } | null;
  onClose: () => void;
}

export default function HtmlTemplateModal({ template, onClose }: HtmlTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlBody: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{message: string; type: "success" | "error"} | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        htmlBody: template.htmlBody || "",
      });
    }
  }, [template]);

  const getSampleData = () => {
    return {
      name: "John Doe",
      email: "john@example.com",
      service: "Premium Plan",
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    };
  };

  const getPreviewHtml = () => {
    const sampleData = getSampleData();
    return replaceTemplateVariables(formData.htmlBody, sampleData);
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
        body: JSON.stringify({
          ...formData,
          isHtmlMode: true,
          isBlockBased: false,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ 
          message: template ? "Template updated successfully!" : "Template created successfully!", 
          type: "success" 
        });
        setTimeout(onClose, 1500);
      } else {
        // Handle error - convert object to string if needed
        if (typeof data.error === 'string') {
          setError(data.error);
        } else if (data.error && data.error.message) {
          setError(data.error.message);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Failed to save template");
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
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8 animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {template ? "Edit HTML Template" : "Create HTML Template"}
              </h2>
              <p className="text-sm text-gray-600">Copy & paste HTML from ChatGPT, Gmail, or any source</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left: Form */}
          <div className="space-y-4">
            <div>
              <label className="label">Template Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., Welcome Email, Monthly Newsletter"
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
                placeholder="e.g., Hi {{name}}, your {{service}} renews soon!"
              />
              <p className="text-xs text-gray-500 mt-1">💡 You can use variables in the subject too</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">HTML Content</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      !showPreview 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Code className="w-3 h-3 inline mr-1" />
                    Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      showPreview 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    Preview
                  </button>
                </div>
              </div>

              {!showPreview ? (
                <div className="relative">
                  <textarea
                    value={formData.htmlBody}
                    onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                    className="input font-mono text-xs min-h-[500px] resize-none bg-gray-900 text-green-400 placeholder-gray-500"
                    placeholder="Paste your HTML here...

Quick example:
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; padding: 30px; text-align: center; 
              border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; }
    .button { background: #667eea; color: white; padding: 12px 30px; 
              text-decoration: none; border-radius: 5px; display: inline-block; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>Hello {{name}}! 👋</h1>
    </div>
    <div class='content'>
      <p>Your <strong>{{service}}</strong> subscription will renew on <strong>{{nextDate}}</strong>.</p>
      <p>Click below to manage your subscription:</p>
      <a href='#' class='button'>Manage Subscription</a>
    </div>
  </div>
</body>
</html>"
                    required
                  />
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded font-mono">
                      {formData.htmlBody.length} chars
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-purple-200 rounded-lg bg-white min-h-[500px] max-h-[500px] overflow-auto shadow-inner">
                  <div 
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Instructions & Help */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Available Variables</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { var: '{{name}}', desc: 'Subscriber name' },
                      { var: '{{email}}', desc: 'Email address' },
                      { var: '{{service}}', desc: 'Service name' },
                      { var: '{{date}}', desc: 'Current date' },
                      { var: '{{nextDate}}', desc: 'Renewal date' },
                    ].map(({ var: v, desc }) => (
                      <div key={v} className="bg-white rounded-lg p-2 border border-blue-200">
                        <code className="text-xs font-bold text-blue-700 block">{v}</code>
                        <span className="text-xs text-gray-600">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                How to Use
              </h3>
              <ol className="space-y-2 text-sm text-purple-900">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Ask ChatGPT: <em>&ldquo;Create a professional HTML email template for subscription renewal&rdquo;</em></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Copy the HTML code it generates</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Paste it in the code editor</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Replace specific text with variables like <code className="bg-purple-200 px-1 rounded">{"{{name}}"}</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">5.</span>
                  <span>Click Preview to see the result!</span>
                </li>
              </ol>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
              <h3 className="font-bold text-green-900 mb-3">✅ Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-green-900">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Include inline CSS styles for best compatibility</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Keep width under 600px for mobile devices</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use tables for layout (old school, but works!)</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Test preview before sending to subscribers</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-800">
                <strong>💡 Pro Tip:</strong> You can also copy HTML from any email you receive in Gmail! 
                Just right-click → View Page Source → Copy the HTML.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-1 shadow-lg hover:shadow-xl"
            disabled={loading || !formData.name || !formData.subject || !formData.htmlBody}
          >
            {loading ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 inline mr-2" />
                {template ? "Update Template" : "Create Template"}
              </>
            )}
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
