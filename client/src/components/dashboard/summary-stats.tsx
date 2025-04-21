import { DashboardStats } from "@/lib/types";

interface SummaryStatsProps {
  stats: DashboardStats;
}

export function SummaryStats({ stats }: SummaryStatsProps) {
  return (
    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Active Goals
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.activeGoals.count}
            <span className="text-sm text-gray-500">/{stats.activeGoals.limit}</span>
          </dd>
          <div className="mt-2 text-xs text-gray-500">
            {stats.activeGoals.count >= stats.activeGoals.limit 
              ? "Free tier limit reached" 
              : `${stats.activeGoals.limit - stats.activeGoals.count} more available`
            }
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Current Streak
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.currentStreak.days} <span className="text-sm text-gray-500">days</span>
          </dd>
          <div className="mt-2 text-xs text-success-600">
            {stats.currentStreak.isLongest ? (
              <>
                <i className="ri-arrow-up-line inline-block"></i> 
                Your longest streak yet!
              </>
            ) : (
              "Keep it going!"
            )}
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Social Engagement
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.socialEngagement.count}
          </dd>
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium">
              {stats.socialEngagement.percentChange > 0 ? "+" : ""}
              {stats.socialEngagement.percentChange}%
            </span> from last week
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Check-in Rate
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.checkInRate.percentage}<span className="text-sm text-gray-500">%</span>
          </dd>
          <div className="mt-2 text-xs text-gray-500">
            <span className={`font-medium ${stats.checkInRate.status === "On track" ? "text-success-600" : "text-warning-500"}`}>
              {stats.checkInRate.status}
            </span> for your goals
          </div>
        </div>
      </div>
    </dl>
  );
}
