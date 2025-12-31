"use client";

import { X } from "lucide-react";
import { replaceTemplateVariables } from "@/lib/template-utils";

interface TemplatePreviewProps {
  template: {
    name: string;
    subject: string;
    body: string;
  };
  onClose: () => void;
}

export default function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  const sampleData = {
    name: "John Doe",
    email: "john@example.com",
    service: "Netflix Premium",
    nextDate: "January 15, 2026",
  };

  const previewSubject = replaceTemplateVariables(template.subject, sampleData);
  const previewBody = replaceTemplateVariables(template.body, sampleData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Preview with sample data</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sample Data</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(sampleData).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-600">{key}:</span>{" "}
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Subject</div>
              <div className="text-gray-900 font-medium">{previewSubject}</div>
            </div>
            <div className="p-4 bg-white">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Body</div>
              <div className="text-gray-900 whitespace-pre-wrap">{previewBody}</div>
            </div>
          </div>

          <div className="mt-6">
            <button onClick={onClose} className="btn btn-primary w-full">
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
