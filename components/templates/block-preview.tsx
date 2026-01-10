"use client";

import { useState, useEffect, useCallback } from "react";
import { Monitor, Smartphone } from "lucide-react";
import type { EmailBlock } from "@/types/email-blocks";

interface BlockPreviewProps {
  blocks: EmailBlock[];
  subject: string;
}

// Sample data for replacing variables in preview
const SAMPLE_VARIABLES = {
  name: "John Doe",
  email: "john@example.com",
  service: "Premium Plan",
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
};

// Function to replace variables in text
function replaceVariables(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return SAMPLE_VARIABLES[variable as keyof typeof SAMPLE_VARIABLES] || match;
  });
}

export default function BlockPreview({ blocks, subject }: BlockPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Generate preview HTML
  const generatePreview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });

      if (response.ok) {
        const { html } = await response.json();
        setPreviewHtml(html);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setLoading(false);
    }
  }, [blocks]);

  // Auto-generate preview when blocks change
  useEffect(() => {
    if (blocks.length > 0) {
      generatePreview();
    } else {
      setPreviewHtml('');
    }
  }, [blocks, generatePreview]);

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Preview</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              viewMode === 'desktop'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              viewMode === 'mobile'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>

      {/* Subject Line Preview */}
      <div className="bg-gray-50 border rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-1">Subject Line:</p>
        <p className="font-medium text-gray-900">{subject ? replaceVariables(subject) : '(No subject)'}</p>
      </div>

      {/* Email Preview */}
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <div className={`mx-auto transition-all ${
          viewMode === 'desktop' ? 'max-w-full' : 'max-w-[375px]'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : blocks.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Add blocks to see preview
            </div>
          ) : (
            <div 
              className="email-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>
      </div>

      {/* Variable Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <p className="text-blue-900 font-medium mb-1">📋 Preview uses sample data:</p>
        <ul className="text-blue-700 space-y-0.5">
          <li>• name = &quot;John Doe&quot;</li>
          <li>• email = &quot;john@example.com&quot;</li>
          <li>• service = &quot;Premium Plan&quot;</li>
          <li>• date = Current date</li>
        </ul>
      </div>
    </div>
  );
}
