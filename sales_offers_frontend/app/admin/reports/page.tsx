"use client";

import { useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiDownload, FiCalendar, FiFileText, FiBarChart, FiUsers, FiDollarSign } from "react-icons/fi";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("revenue");
  const [dateRange, setDateRange] = useState("30d");

  const reports = [
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Detailed revenue breakdown by time period",
      icon: FiDollarSign,
      color: "green"
    },
    {
      id: "users",
      title: "User Activity Report",
      description: "User registration and activity metrics",
      icon: FiUsers,
      color: "blue"
    },
    {
      id: "deals",
      title: "Deals Performance",
      description: "Deal conversion and performance analytics",
      icon: FiBarChart,
      color: "purple"
    },
    {
      id: "sellers",
      title: "Seller Analytics",
      description: "Seller performance and revenue metrics",
      icon: FiFileText,
      color: "orange"
    }
  ];

  const generateReport = () => {
    alert(`Generating ${reports.find(r => r.id === selectedReport)?.title} for ${dateRange}...`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Reports</h1>
            <p className="text-[rgb(var(--color-muted))]">Generate and download detailed reports</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>Admin Only</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Selection */}
          <div className="lg:col-span-1">
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Select Report Type</h3>
              <div className="space-y-3">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedReport === report.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-ui))]'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/30`}>
                        <report.icon className={`w-5 h-5 text-${report.color}-600 dark:text-${report.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[rgb(var(--color-fg))]">{report.title}</h4>
                        <p className="text-sm text-[rgb(var(--color-muted))] mt-1">{report.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Report Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Date Range</label>
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="text-[rgb(var(--color-muted))] w-4 h-4" />
                    <select
                      className="flex-1 px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="6m">Last 6 months</option>
                      <option value="1y">Last year</option>
                      <option value="custom">Custom range</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <div className="text-center">
                        <FiFileText className="w-6 h-6 mx-auto mb-1 text-[rgb(var(--color-muted))]" />
                        <span className="text-sm text-[rgb(var(--color-fg))]">PDF</span>
                      </div>
                    </button>
                    <button className="p-3 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <div className="text-center">
                        <FiBarChart className="w-6 h-6 mx-auto mb-1 text-[rgb(var(--color-muted))]" />
                        <span className="text-sm text-[rgb(var(--color-fg))]">Excel</span>
                      </div>
                    </button>
                    <button className="p-3 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <div className="text-center">
                        <FiFileText className="w-6 h-6 mx-auto mb-1 text-[rgb(var(--color-muted))]" />
                        <span className="text-sm text-[rgb(var(--color-fg))]">CSV</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-[rgb(var(--color-border))] pt-6">
                  <button
                    onClick={generateReport}
                    className="flex items-center space-x-2 w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))] mt-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Recent Reports</h3>
              <div className="space-y-3">
                {[
                  { name: "Revenue Report - January 2024", date: "2024-01-20", size: "2.4 MB", format: "PDF" },
                  { name: "User Activity Report - December 2023", date: "2024-01-01", size: "1.8 MB", format: "Excel" },
                  { name: "Deals Performance - Q4 2023", date: "2023-12-31", size: "3.1 MB", format: "PDF" }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--color-ui))]">
                    <div className="flex items-center space-x-3">
                      <FiFileText className="w-5 h-5 text-[rgb(var(--color-muted))]" />
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{report.name}</p>
                        <p className="text-xs text-[rgb(var(--color-muted))]">{report.date} • {report.size} • {report.format}</p>
                      </div>
                    </div>
                    <button className="p-2 text-[rgb(var(--color-muted))] hover:text-red-600 transition-colors">
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}