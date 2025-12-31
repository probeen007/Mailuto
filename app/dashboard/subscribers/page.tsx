"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import SubscriberModal from "@/components/subscribers/subscriber-modal";

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  service: string;
  nextDate?: string;
  customVariables?: Record<string, string>;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubscribers(subscribers.filter((s) => s._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
    }
  };

  const handleEdit = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSubscriber(null);
    fetchSubscribers();
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribers</h1>
          <p className="text-gray-600">Manage your email recipients</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Add Subscriber</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No subscribers found matching your search." : "No subscribers yet. Add your first one!"}
          </p>
          {!searchTerm && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscriber
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubscribers.map((subscriber) => (
            <div key={subscriber._id} className="card hover:shadow-lg transition-shadow duration-200 animate-slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{subscriber.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{subscriber.email}</p>
                  <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                    {subscriber.service}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(subscriber)}
                    className="btn btn-secondary text-sm"
                  >
                    <Edit className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(subscriber._id)}
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
        <SubscriberModal
          subscriber={editingSubscriber}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
