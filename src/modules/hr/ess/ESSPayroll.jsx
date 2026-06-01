import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Search,
  Loader,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { payrollAPI } from "../services/hrAPI";
import { SalarySummaryCard, StatsCard, EmptyState } from "../shared/components";
import { formatDate, formatCurrency, downloadCSV } from "../utils/helpers";

export const ESSPayroll = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [salary, setSalary] = useState(null);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchMonth, setSearchMonth] = useState("");

  useEffect(() => {
    fetchPayrollData();
  }, [selectedYear]);

  const fetchPayrollData = async () => {
    setLoadingState(true);
    try {
      // Fetch current salary
      const salaryRes = await payrollAPI.getEmployeeSalary();
      if (salaryRes.data && salaryRes.data.length > 0) {
        setSalary(salaryRes.data[0]);
      }

      // Fetch payroll records
      const payrollRes = await payrollAPI.getPayroll({ year: selectedYear });
      setPayrollRecords(payrollRes.data || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const filteredRecords = payrollRecords.filter(
    (record) => !searchMonth || record.payroll_period.includes(searchMonth),
  );

  const calculateYTD = () => {
    return filteredRecords.reduce(
      (sum, record) => sum + (record.net_salary || 0),
      0,
    );
  };

  const handleDownloadPayslip = async (payrollId) => {
    try {
      // This would typically generate a PDF
      // For now, we'll just download as CSV
      const payroll = filteredRecords.find((p) => p.id === payrollId);
      if (payroll) {
        downloadCSV([payroll], `payslip_${payroll.payroll_period}.csv`);
      }
    } catch (err) {
      setErrorState("Error downloading payslip");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll & Salary</h1>
          <p className="text-gray-600 mt-1">
            View your payslips and salary information
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Current Salary Summary */}
      {salary && (
        <div className="mb-8">
          <SalarySummaryCard salary={salary} />
        </div>
      )}

      {/* YTD Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="YTD Gross Salary"
          value={formatCurrency(
            filteredRecords.reduce((sum, r) => sum + (r.gross_salary || 0), 0),
          )}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="YTD Net Salary"
          value={formatCurrency(calculateYTD())}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Total Deductions YTD"
          value={formatCurrency(
            filteredRecords.reduce(
              (sum, r) => sum + (r.total_deductions || 0),
              0,
            ),
          )}
          icon={DollarSign}
          color="red"
        />
      </div>

      {/* Payroll Records */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Payslips</h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by month..."
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Gross Salary
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {record.payroll_period}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatCurrency(record.gross_salary)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatCurrency(record.total_deductions)}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-green-600">
                      {formatCurrency(record.net_salary)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : record.status === "APPROVED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleDownloadPayslip(record.id)}
                        className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Download Payslip"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No payslips"
            description={`No payslips available for ${selectedYear}`}
            icon={DollarSign}
          />
        )}
      </div>

      {/* Salary Certificate */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Salary Certificate
        </h3>
        <p className="text-gray-600 mb-4">
          Get a signed salary certificate for loan applications or other
          purposes
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Request Certificate
        </button>
      </div>
    </div>
  );
};

export default ESSPayroll;
