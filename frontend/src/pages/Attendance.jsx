import { useEffect, useState } from 'react'
import { employeesApi, attendanceApi } from '../services/api'

// UPDATED: Use locale-aware date string to get accurate local "Today"
const today = new Date().toLocaleDateString('en-CA') 

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [history, setHistory] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [markDate, setMarkDate] = useState(today)
  const [markStatus, setMarkStatus] = useState('Present')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [historyEmployeeId, setHistoryEmployeeId] = useState('')

  useEffect(() => {
    setLoadingEmployees(true)
    setError(null)
    employeesApi
      .list()
      .then((res) => setEmployees(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || err.message || 'Failed to load employees')
      )
      .finally(() => setLoadingEmployees(false))
  }, [])

  useEffect(() => {
    if (historyEmployeeId === '') {
      setHistory([])
      return
    }
    setLoadingHistory(true)
    attendanceApi
      .history(Number(historyEmployeeId))
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false))
  }, [historyEmployeeId])

  const handleMark = (e) => {
    e.preventDefault()

    // UPDATED: Logic check to prevent future dates
    if (markDate > today) {
        setError("You cannot mark attendance for a future date.")
        return
    }

    if (selectedEmployeeId === '' || submitLoading) return
    setSubmitLoading(true)
    setError(null)
    setSuccess(null)
    attendanceApi
      .mark({
        employee_id: Number(selectedEmployeeId),
        date: markDate,
        status: markStatus,
      })
      .then(() => {
        setSuccess('Attendance recorded.')
        if (historyEmployeeId === selectedEmployeeId) {
          attendanceApi.history(Number(selectedEmployeeId)).then((res) => setHistory(res.data))
        }
      })
      .catch((err) =>
        setError(err.response?.data?.detail || err.message || 'Failed to mark attendance')
      )
      .finally(() => setSubmitLoading(false))
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Attendance</h1>

      {success && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-slate-800">Mark Attendance</h2>
        {loadingEmployees ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        ) : (
          <form onSubmit={handleMark} className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700">Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) =>
                  setSelectedEmployeeId(e.target.value === '' ? '' : e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                value={markDate}
                max={today} // UPDATED: Blocks future dates in the calendar picker
                onChange={(e) => setMarkDate(e.target.value)}
                className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={markStatus}
                onChange={(e) => setMarkStatus(e.target.value)}
                className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {submitLoading ? 'Saving…' : 'Mark'}
            </button>
          </form>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-slate-800">Attendance History</h2>
        <div className="mb-4 max-w-xs">
          <label className="block text-sm font-medium text-slate-700">View by employee</label>
          <select
            value={historyEmployeeId}
            onChange={(e) =>
              setHistoryEmployeeId(e.target.value === '' ? '' : e.target.value)
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          </div>
        ) : history.length === 0 ? (
          <p className="py-6 text-slate-500">
            {historyEmployeeId === ''
              ? 'Select an employee to view history.'
              : 'No attendance records for this employee.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-800">
                      {r.date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span
                        className={
                          r.status === 'Present'
                            ? 'rounded bg-emerald-100 px-2 py-0.5 text-sm text-emerald-700'
                            : 'rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-700'
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}