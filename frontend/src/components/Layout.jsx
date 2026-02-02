import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed left-0 top-0 z-10 h-full w-56 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-14 items-center border-b border-slate-200 px-6">
          <h1 className="text-lg font-semibold text-slate-800">HRMS Lite</h1>
        </div>
        <nav className="mt-4 space-y-0.5 px-3">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="pl-56">
        <div className="min-h-screen p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
