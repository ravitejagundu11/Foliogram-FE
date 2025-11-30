"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  // -----------------------------
  // MOCK DATA (FALLBACK)
  // -----------------------------
  const mockData = {
    views: 1240,
    sessions: 678,
    resumeViews: 310,
    salaryExpectations: "₹12 LPA",
    viewsOverTime: [
      { date: "Mon", views: 120 },
      { date: "Tue", views: 180 },
      { date: "Wed", views: 140 },
      { date: "Thu", views: 260 },
      { date: "Fri", views: 200 },
      { date: "Sat", views: 300 },
      { date: "Sun", views: 240 },
    ],
    viewerCompanies: [
      { name: "Google", value: 4 },
      { name: "Amazon", value: 3 },
      { name: "Infosys", value: 6 },
      { name: "TCS", value: 2 },
    ],
    whoViewed: [
      { ip: "192.168.0.12", company: "Google" },
      { ip: "192.168.0.19", company: "Infosys" },
      { ip: "10.0.0.5", company: "Amazon" },
    ],
  };

  useEffect(() => {
    async function loadAnalytics() {
      try {
        // ---------------------------------------------------------
        // BACKEND FETCH CODE (Commented out as requested)
        // ---------------------------------------------------------
        /*
        const res = await fetch(`/api/analytics/123`);

        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        setData({
          views: json.totalViews,
          sessions: json.sessions,
          resumeViews: json.resumeViews,
          salaryExpectations: `₹${json.salaryExpectationAvg}`,
          viewsOverTime: json.viewsOverTime,
          viewerCompanies: json.connections.map((c: any) => ({
            name: c.type,
            value: c.value,
          })),
          whoViewed: json.viewers.map((v: any) => ({
            ip: v.ip,
            company: v.company,
            time: v.time,
          })),
        });
        return;
        */
        // ---------------------------------------------------------

        // If backend fails → use mock data
        console.warn("Backend disabled. Using mock data.");
        setData(mockData);
      } catch (err) {
        console.warn("Backend unavailable → Using mock data.");
        setData(mockData);
      }
    }

    loadAnalytics();
  }, []);

  if (!data) return <p className="text-center mt-10">Loading analytics...</p>;

  return (
    <div className="p-6 space-y-8 w-full max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
      <p className="text-gray-500">Track how your portfolio performs across the internet.</p>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[{
          label: "Total Views",
          value: data.views,
        },{
          label: "Total Sessions",
          value: data.sessions,
        },{
          label: "Resume Views",
          value: data.resumeViews,
        },{
          label: "Salary Expectation",
          value: data.salaryExpectations,
        }].map((item, idx) => (
          <Card key={idx} className="shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
            <CardContent className="p-5">
              <h2 className="text-2xl font-semibold">{item.value}</h2>
              <p className="text-gray-500 text-sm">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* LINE CHART */}
      <Card className="shadow-md rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Views Over Time</h2>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <LineChart data={data.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* PIE CHART */}
      <Card className="shadow-md rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Viewer Companies</h2>
          <div className="w-full flex justify-center h-72">
            <ResponsiveContainer width="80%">
              <PieChart>
                <Pie
                  data={data.viewerCompanies}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {data.viewerCompanies.map((_: any, index: number) => (
                    <Cell
                      key={index}
                      fill={["#6366F1", "#10B981", "#F59E0B", "#EF4444"][index % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* VIEWER LIST */}
      <Card className="shadow-md rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Who Viewed Your Profile</h2>
          <div className="space-y-3">
            {data.whoViewed.map((v: any, i: number) => (
              <div
                key={i}
                className="border p-4 rounded-xl flex justify-between items-center bg-gray-50 hover:bg-white transition shadow-sm"
              >
                <span className="font-medium">{v.company}</span>
                <span className="text-gray-500 text-sm">{v.ip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
