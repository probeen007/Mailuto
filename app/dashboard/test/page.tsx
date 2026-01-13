"use client";

import { useState } from "react";
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestSend = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/test-send", {
        method: "POST",
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: "Failed to test email sending",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Email Automation</h1>
        <p className="text-gray-600">Send test emails to verify your automation setup</p>
      </div>

      <div className="card max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Manual Trigger</h2>
          <p className="text-sm text-gray-600 mb-4">
            This will immediately send emails to all active subscribers in groups.
            Use this to test if your email automation is working correctly.
            <span className="block mt-2 text-primary-600 font-medium">
              Limited to first 50 subscribers for testing purposes.
            </span>
          </p>
          
          <button
            onClick={handleTestSend}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Test Emails Now</span>
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Results</h3>
            
            {result.error ? (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">{result.error}</p>
                  {result.details && (
                    <p className="text-red-600 text-sm mt-1">{result.details}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <p className="text-blue-800 font-medium">{result.message}</p>
                </div>

                {result.results && result.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Email Details:</h4>
                    {result.results.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-sm ${
                          item.status === "success"
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        {item.status === "success" ? (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-green-800 font-medium">
                                Sent to: {item.subscriber}
                              </p>
                              <p className="text-green-700 text-xs">
                                Template: {item.template}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-800 font-medium">Failed</p>
                              {item.message && (
                                <p className="text-red-700 text-xs">{item.message}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This test will send real emails using your Resend API.
            Make sure your email recipients are valid and expecting test emails.
          </p>
        </div>
      </div>
    </div>
  );
}
