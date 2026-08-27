import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { Toast } from './components/Toast'
import Welcome from './pages/Welcome'
import SignUp from './pages/SignUp'
import LogIn from './pages/LogIn'
import Family from './pages/Family'
import ChildProfileWizard from './pages/ChildProfileWizard'
import TaskSelection from './pages/TaskSelection'
import RoutineBuilder from './pages/RoutineBuilder'
import RoutinePreview from './pages/RoutinePreview'
import RoutinePdfGenerated from './pages/RoutinePdfGenerated'
import WeeklyTasks from './pages/WeeklyTasks'
import SpecialRoutines from './pages/SpecialRoutines'
import SpecialRoutineEditor from './pages/SpecialRoutineEditor'
import HowToCards from './pages/HowToCards'
import HowToCardEditor from './pages/HowToCardEditor'
import CustomTaskCreate from './pages/CustomTaskCreate'
import Dashboard from './pages/Dashboard'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUserId = useAppStore((s) => s.currentUserId)
  if (!currentUserId) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/entrar" element={<LogIn />} />
        <Route
          path="/familia"
          element={
            <RequireAuth>
              <Family />
            </RequireAuth>
          }
        />
        <Route
          path="/painel"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/perfil/:step"
          element={
            <RequireAuth>
              <ChildProfileWizard />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/responsabilidades"
          element={
            <RequireAuth>
              <TaskSelection />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/tarefa-propria"
          element={
            <RequireAuth>
              <CustomTaskCreate />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/rotina"
          element={
            <RequireAuth>
              <RoutineBuilder />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/rotina/preview"
          element={
            <RequireAuth>
              <RoutinePreview />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/rotina/pdf"
          element={
            <RequireAuth>
              <RoutinePdfGenerated />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/semana"
          element={
            <RequireAuth>
              <WeeklyTasks />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/especiais"
          element={
            <RequireAuth>
              <SpecialRoutines />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/especiais/:specialId"
          element={
            <RequireAuth>
              <SpecialRoutineEditor />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/como-fazer"
          element={
            <RequireAuth>
              <HowToCards />
            </RequireAuth>
          }
        />
        <Route
          path="/crianca/:childId/como-fazer/:cardId"
          element={
            <RequireAuth>
              <HowToCardEditor />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}
