"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Eye, Layers, FileText } from "lucide-react";
import TemplateModal from "@/components/templates/template-modal";
import BlockTemplateModal from "@/components/templates/block-template-modal";
import TemplatePreview from "@/components/templates/template-preview";

interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  blocks?: any[];
  isBlockBased?: boolean;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates(templates.filter((t) => t._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    if (template.isBlockBased) {
      setIsBlockModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsBlockModalOpen(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
          <p className="text-gray-600">Create reusable templates with variables</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setEditingTemplate(null);
              setIsModalOpen(true);
            }} 
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow transform hover:scale-105 active:scale-95"
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Text Template</span>
          </button>
          <button 
            onClick={() => {
              setEditingTemplate(null);
              setIsBlockModalOpen(true);
            }} 
            className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Layers className="w-4 h-4 md:w-5 md:h-5" />
            <span>Block Template</span>
          </button>
        </div>
      </div>

      <div className="card bg-blue-50 border border-blue-200 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Available Variables</h3>
        <div className="flex flex-wrap gap-2">
          {["{{name}}", "{{email}}", "{{service}}", "{{nextDate}}"].map((variable) => (
            <code key={variable} className="bg-white px-3 py-1 rounded text-sm text-blue-700 font-mono border border-blue-300">
              {variable}
            </code>
          ))}
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Use these variables in your templates. They&apos;ll be automatically replaced with subscriber data.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No templates yet. Create your first one!</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                setEditingTemplate(null);
                setIsModalOpen(true);
              }} 
              className="btn btn-secondary"
            >
              <FileText className="w-4 h-4 mr-2" />
              Text Template
            </button>
            <button 
              onClick={() => {
                setEditingTemplate(null);
                setIsBlockModalOpen(true);
              }} 
              className="btn btn-primary"
            >
              <Layers className="w-4 h-4 mr-2" />
              Block Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div key={template._id} className="card hover:shadow-lg transition-shadow duration-200 animate-slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {template.isBlockBased ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        <Layers className="w-3 h-3" />
                        Block
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        <FileText className="w-3 h-3" />
                        Text
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Subject:</span>
                    <p className="text-gray-700">{template.subject}</p>
                  </div>
                  {!template.isBlockBased && template.body && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Body Preview:</span>
                      <p className="text-gray-600 text-sm line-clamp-2">{template.body}</p>
                    </div>
                  )}
                  {template.isBlockBased && template.blocks && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Blocks:</span>
                      <p className="text-gray-600 text-sm">{template.blocks.length} block(s)</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="btn btn-secondary text-sm"
                  >
                    <Eye className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="btn btn-secondary text-sm"
                  >
                    <Edit className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="btn btn-danger text-sm"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TemplateModal
          template={editingTemplate}
          onClose={handleModalClose}
        />
      )}

      {isBlockModalOpen && (
        <BlockTemplateModal
          template={editingTemplate}
          onClose={handleModalClose}
        />
      )}

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
