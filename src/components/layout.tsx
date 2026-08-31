import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/app-store'

const links = [
  ['/', 'Dashboard'],
  ['/today', 'Hoje'],
  ['/tasks', 'Tarefas'],
  ['/calendar', 'Calendário'],
  ['/routines', 'Rotinas'],
  ['/projects', 'Projetos'],
  ['/notes', 'Notas'],
  ['/reports', 'Relatórios'],
  ['/ai', 'Assistente IA'],
  ['/backup', 'Backup'],
  ['/settings', 'Configurações'],
]

export const AppLayout = () => {
  const user = useAppStore((state) => state.currentUser)
  const logout = useAppStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:grid-cols-[260px_1fr]">
      <aside className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:border-b-0 md:border-r">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold">
            Finanças Railana
          </Link>
          <button
            className="text-sm text-slate-500 hover:text-slate-700"
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Sair
          </button>
        </div>

        <p className="mb-4 text-xs text-slate-500">Olá, {user?.name ?? 'Usuária'}.</p>

        <nav className="flex flex-wrap gap-2 md:flex-col">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
