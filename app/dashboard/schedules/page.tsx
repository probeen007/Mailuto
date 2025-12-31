"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, Power, PowerOff, XCircle } from "lucide-react";
import { format } from "date-fns";
import ScheduleModal from "@/components/schedules/schedule-modal";

interface Schedule {
  _id: string;
  subscriberId: {
    _id: string;
    name: string;
    email: string;
    service: string;
  };
  templateId: {
    _id: string;
    name: string;
  };
  scheduleType: "monthly" | "interval";
  dayOfMonth?: number;
  intervalDays?: number;
  nextSendDate: string;
  lastSentDate?: string;
  isActive: boolean;
  createdAt: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSchedules(schedules.filter((s) => s._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error("Failed to toggle schedule:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchSchedules();
  };

  const getScheduleDescription = (schedule: Schedule) => {
    if (schedule.scheduleType === "monthly") {
      return `Monthly on day ${schedule.dayOfMonth}`;
    } else {
      return `Every ${schedule.intervalDays} days`;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedules</h1>
          <p className="text-gray-600">Automate your email reminders</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Create Schedule</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : schedules.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            No schedules yet. Create your first automated email!
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => {
            // Safety checks for deleted subscribers/templates
            const subscriber = schedule.subscriberId;
            const template = schedule.templateId;
            
            if (!subscriber || !template) {
              return (
                <div key={schedule._id} className="card bg-red-50 border border-red-200">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">Broken Schedule</p>
                      <p className="text-red-600 text-sm">
                        {!subscriber && "Subscriber deleted. "}
                        {!template && "Template deleted."}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      className="btn bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }
            
            return (
            <div
              key={schedule._id}
              className={`card hover:shadow-lg transition-all duration-200 animate-slide-up ${
                !schedule.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${schedule.isActive ? "bg-green-100" : "bg-gray-100"}`}>
                      <CalendarIcon className={`w-5 h-5 ${schedule.isActive ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscriber.name} - {subscriber.service}
                      </h3>
                      <p className="text-sm text-gray-600">{subscriber.email}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 ml-12">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                        Template
                      </span>
                      <p className="text-gray-900">{template.name}</p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                        Frequency
                      </span>
                      <p className="text-gray-900">{getScheduleDescription(schedule)}</p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                        Next Send
                      </span>
                      <p className="text-gray-900 font-medium">
                        {format(new Date(schedule.nextSendDate), "MMM d, yyyy")}
                      </p>
                    </div>

                    {schedule.lastSentDate && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                          Last Sent
                        </span>
                        <p className="text-gray-900">
                          {format(new Date(schedule.lastSentDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 lg:flex-col">
                  <button
                    onClick={() => toggleActive(schedule._id, schedule.isActive)}
                    className={`btn text-sm ${
                      schedule.isActive
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    title={schedule.isActive ? "Pause schedule" : "Activate schedule"}
                  >
                    {schedule.isActive ? (
                      <>
                        <PowerOff className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Activate</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(schedule._id)}
                    className="btn btn-danger text-sm"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {isModalOpen && <ScheduleModal onClose={handleModalClose} />}
    </div>
  );
}
