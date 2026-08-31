import { Toaster } from 'sonner'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout'
import { DashboardPage } from './features/dashboard'
import { LoginPage, ProtectedRoute, RegisterPage } from './features/auth/auth-pages'
import { TasksPage } from './features/tasks/tasks-page'
import { CalendarPage } from './features/calendar/calendar-page'
import { RoutinesPage } from './features/routines-page'
import { ProjectsPage } from './features/projects-page'
import { NotesPage } from './features/notes-page'
import { ReportsPage } from './features/reports/reports-page'
import { AIAssistantPage } from './features/ai/ai-assistant-page'
import { BackupPage } from './features/backup/backup-page'
import { SettingsPage } from './features/settings/settings-page'
import { OnboardingPage } from './features/onboarding/onboarding-page'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/today" element={<TasksPage view="today" />} />
            <Route path="/tasks" element={<TasksPage view="all" />} />
            <Route path="/tasks/favorites" element={<TasksPage view="favorites" />} />
            <Route path="/tasks/overdue" element={<TasksPage view="overdue" />} />
            <Route path="/tasks/completed" element={<TasksPage view="completed" />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/backup" element={<BackupPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
