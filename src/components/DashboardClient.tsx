"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, BodyMetric, PersonalRecord, Workout, Set, Exercise } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";
import { format } from "date-fns";
import { analyzeWeightPRCorrelation, generateInsights } from "@/lib/analytics";

type UserWithRelations = User & {
  bodyMetrics: BodyMetric[];
  personalRecords: (PersonalRecord & { exercise: Exercise })[];
  workouts: (Workout & { sets: (Set & { exercise: Exercise })[] })[];
};

interface Props {
  user: UserWithRelations;
}

export default function DashboardClient({ user }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "workouts" | "metrics" | "nutrition" | "analytics"
  >("overview");

  // Get latest body metric
  const latestMetric = user.bodyMetrics[0];

  // Analyze weight vs PR correlation
  const analytics = analyzeWeightPRCorrelation(
    user.bodyMetrics,
    user.personalRecords
  );

  const insights = generateInsights(analytics);

  // Prepare chart data
  const chartData = analytics.correlations.map((c) => ({
    date: format(c.date, "MM/dd"),
    bodyWeight: c.bodyWeight,
    estimatedMax: c.estimatedMax,
    ratio: c.strengthToWeightRatio.toFixed(2),
  }));

  // Get recent workouts
  const recentWorkouts = user.workouts.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              nSuns Tracker
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "workouts", label: "Workouts" },
              { id: "metrics", label: "Body Metrics" },
              { id: "analytics", label: "Analytics" },
              { id: "nutrition", label: "Nutrition" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Weight
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {latestMetric ? `${latestMetric.weight} lbs` : "No data"}
                </p>
                {latestMetric?.date && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(latestMetric.date), "MMM dd, yyyy")}
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Workouts
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {user.workouts.length}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Strength/Weight Ratio
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.currentRatio
                    ? analytics.currentRatio.strengthToWeightRatio.toFixed(2)
                    : "N/A"}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Trend: {analytics.trend}
                </p>
              </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Insights & Recommendations
                </h3>
                <ul className="space-y-2">
                  {insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-blue-800 dark:text-blue-200"
                    >
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recent Workouts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Workouts
                </h3>
              </div>
              <div className="p-6">
                {recentWorkouts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No workouts yet.{" "}
                    <button
                      onClick={() => setActiveTab("workouts")}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Start your first workout
                    </button>
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                              {workout.dayType} Day
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(workout.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              workout.completed
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                            }`}
                          >
                            {workout.completed ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {workout.sets.length} sets completed
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Body Weight vs Max PR Correlation
              </h3>

              {chartData.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No data available yet. Start logging your workouts and body
                  metrics to see analytics.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: "Body Weight (lbs)", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: "Max (lbs)", angle: 90, position: "insideRight" }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="bodyWeight"
                      fill="#8884d8"
                      stroke="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="estimatedMax"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Strength-to-Weight Ratio Over Time
              </h3>

              {chartData.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No data available yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ratio"
                      name="Strength/Weight Ratio"
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Personal Records Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Personal Records
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Exercise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Est. 1RM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {user.personalRecords.map((pr) => (
                      <tr key={pr.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {pr.exercise.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {pr.weight} lbs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {pr.reps}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {pr.estimatedMax.toFixed(0)} lbs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(pr.date), "MMM dd, yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "workouts" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Workouts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Workout logging interface coming soon. This will include nSuns program tracking.
            </p>
            <button
              onClick={() => router.push("/workouts/new")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Start New Workout
            </button>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Body Metrics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Track your weight, body fat %, and other measurements.
            </p>
            <button
              onClick={() => router.push("/metrics/new")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Log New Measurement
            </button>

            {/* Body Metrics Chart */}
            {user.bodyMetrics.length > 0 && (
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={user.bodyMetrics
                      .slice()
                      .reverse()
                      .map((m) => ({
                        date: format(new Date(m.date), "MM/dd"),
                        weight: m.weight,
                        bodyFat: m.bodyFatPct,
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="Weight (lbs)"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    {user.bodyMetrics.some((m) => m.bodyFatPct) && (
                      <Line
                        type="monotone"
                        dataKey="bodyFat"
                        name="Body Fat %"
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nutrition Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Nutrition logging coming soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
