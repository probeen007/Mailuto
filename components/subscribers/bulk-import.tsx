"use client";

import { useState, useEffect } from "react";
import { X, Upload, Download, AlertCircle, CheckCircle } from "lucide-react";

interface BulkImportProps {
  onClose: () => void;
  defaultGroupId?: string;
}

interface Group {
  _id: string;
  name: string;
}

export default function BulkImport({ onClose, defaultGroupId }: BulkImportProps) {
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const downloadTemplate = () => {
    const template = `name,email,service,nextSendDate
John Doe,john@example.com,Premium Plan,2026-02-01
Jane Smith,jane@example.com,Basic Plan,2026-02-15`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCSVFile(file);
      setResult(null);
    } else {
      alert('Please select a CSV file');
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const handleImport = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    if (!selectedGroupId) {
      alert('Please select a group');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const text = await csvFile.text();
      const csvData = parseCSV(text);

      const res = await fetch('/api/subscribers/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvData,
          groupId: selectedGroupId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const data = await res.json();
        alert(data.error || 'Import failed');
      }
    } catch (error) {
      alert('An error occurred during import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bulk Import Subscribers</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📋 CSV Format</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Required columns: <code>name, email, service, nextSendDate</code></li>
                <li>• Date format: <code>YYYY-MM-DD</code> (e.g., 2026-02-15)</li>
                <li>• First row must be headers</li>
                <li>• Optional: Add custom columns for variables</li>
              </ul>
              <button
                onClick={downloadTemplate}
                className="mt-3 text-sm text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>

            <div>
              <label className="label">Select Group *</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="input"
                required
              >
                <option value="">Choose a group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Upload CSV File *</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {csvFile && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {csvFile.name}
                  </span>
                )}
              </div>
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
              <button
                onClick={handleImport}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={loading || !csvFile || !selectedGroupId}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Import Complete
              </h3>
              <p className="text-sm text-green-700">
                ✓ {result.success} subscribers imported successfully
              </p>
              {result.failed > 0 && (
                <p className="text-sm text-red-700 mt-1">
                  ✗ {result.failed} failed
                </p>
              )}
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Errors ({result.errors.length})
                </h3>
                <div className="space-y-2">
                  {result.errors.slice(0, 10).map((err: any, i: number) => (
                    <div key={i} className="text-sm text-red-700">
                      Row {err.row} ({err.email}): {err.error}
                    </div>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="text-sm text-red-600 italic">
                      ... and {result.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            <button onClick={onClose} className="w-full btn-primary">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
