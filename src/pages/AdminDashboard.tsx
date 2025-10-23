import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ManageCourts } from "../components/dashboard/ManageCourts";
import { AdminAllBookings } from "../components/dashboard/AdminAllBookings";
import { UserManagement } from "../components/dashboard/UserManagement";
import { RevenueAnalytics } from "../components/dashboard/RevenueAnalytics";
import { AdminTrainerSessions } from "../components/dashboard/AdminTrainerSessions";

interface AdminDashboardProps {
  userId: Id<"users">;
}

export function AdminDashboard({ userId }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/20">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-8">
            Admin Dashboard
          </h1>

          <div className="space-y-8">
            {/* Revenue Analytics Section */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Revenue Analytics</h2>
              <RevenueAnalytics userId={userId} />
            </div>

            {/* User Management Section */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-4">User Management</h2>
              <UserManagement userId={userId} />
            </div>

            {/* Courts and Bookings */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Courts & Bookings</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ManageCourts userId={userId} />
                <AdminAllBookings userId={userId} />
              </div>
            </div>

            {/* Trainer Sessions Management */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Trainer Sessions</h2>
              <AdminTrainerSessions userId={userId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
