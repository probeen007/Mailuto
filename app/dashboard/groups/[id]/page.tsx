"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Upload, UserPlus, Trash2, MoveRight } from "lucide-react";
import SubscriberModal from "@/components/subscribers/subscriber-modal";
import BulkImport from "@/components/subscribers/bulk-import";

interface Group {
  _id: string;
  name: string;
  templateId: {
    _id: string;
    name: string;
  };
  intervalDays: number;
  isActive: boolean;
  subscribers: Array<{
    _id: string;
    name: string;
    email: string;
    service: string;
    groupId?: string;
    nextDate?: string;
    nextSendDate?: string;
    isActive: boolean;
    customVariables?: Record<string, string>;
  }>;
}

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data);
      }
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscribers = async () => {
    if (!confirm(`Delete ${selectedSubscribers.length} selected subscribers?`)) return;

    try {
      await Promise.all(
        selectedSubscribers.map((id) =>
          fetch(`/api/subscribers/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedSubscribers([]);
      fetchGroup();
    } catch (error) {
      alert('Failed to delete subscribers');
    }
  };

  const toggleSelectAll = () => {
    if (selectedSubscribers.length === group?.subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(group?.subscribers.map((s) => s._id) || []);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!group) {
    return <div className="text-center py-12">Group not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/groups')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600">
            Template: {group.templateId.name} • Every {group.intervalDays} days
          </p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Subscriber
        </button>
        <button
          onClick={() => setIsBulkImportOpen(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Bulk Import
        </button>
        {selectedSubscribers.length > 0 && (
          <>
            <button
              onClick={handleDeleteSubscribers}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedSubscribers.length})
            </button>
          </>
        )}
      </div>

      {group.subscribers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers yet</h3>
          <p className="text-gray-600 mb-4">Add subscribers to this group</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.length === group.subscribers.length}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Next Send
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {group.subscribers.map((subscriber) => (
                <tr key={subscriber._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.includes(subscriber._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubscribers([...selectedSubscribers, subscriber._id]);
                        } else {
                          setSelectedSubscribers(
                            selectedSubscribers.filter((id) => id !== subscriber._id)
                          );
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{subscriber.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subscriber.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subscriber.service}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {subscriber.nextSendDate
                      ? new Date(subscriber.nextSendDate).toLocaleDateString()
                      : 'Not set'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        subscriber.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {subscriber.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <SubscriberModal
          onClose={() => {
            setIsModalOpen(false);
            fetchGroup();
          }}
          defaultGroupId={groupId}
        />
      )}

      {isBulkImportOpen && (
        <BulkImport
          onClose={() => {
            setIsBulkImportOpen(false);
            fetchGroup();
          }}
          defaultGroupId={groupId}
        />
      )}
    </div>
  );
}
