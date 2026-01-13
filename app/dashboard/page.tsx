import Link from "next/link";
import { Users, Mail, FolderKanban, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your email automation</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/groups" className="card hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FolderKanban className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Groups</h3>
              <p className="text-sm text-gray-600">Organize subscribers</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/subscribers" className="card hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-100 rounded-lg">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Subscribers</h3>
              <p className="text-sm text-gray-600">Manage your contacts</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/templates" className="card hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Templates</h3>
              <p className="text-sm text-gray-600">Create email templates</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="card bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <ol className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>Create email templates using variables like {`{{name}}`}, {`{{email}}`}, {`{{service}}`}, {`{{nextDate}}`}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>Create groups with your templates and set email sending intervals</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>Add subscribers to groups individually or bulk import via CSV</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <span>Emails are automatically sent based on each subscriber&apos;s individual schedule</span>
          </li>
        </ol>
        <Link href="/dashboard/templates" className="btn bg-white text-primary-600 hover:bg-gray-100">
          <Plus className="inline w-4 h-4 mr-2" />
          Create Your First Template
        </Link>
      </div>
    </div>
  );
}
