import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Card } from '../../components/ui'
import { useAppStore } from '../../store/app-store'

const defaultAreas = ['Trabalho', 'Estudos', 'Finanças', 'Casa', 'Projetos', 'Pessoal']

export const OnboardingPage = () => {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.currentUser)
  const onboardingDone = useAppStore((state) => state.onboardingDone)
  const finishOnboarding = useAppStore((state) => state.finishOnboarding)
  const [selected, setSelected] = useState<string[]>(['Trabalho', 'Finanças'])

  if (!user) return <Navigate to="/login" replace />
  if (onboardingDone) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold">Vamos organizar seu espaço</h1>
        <p className="text-sm text-slate-500">Selecione as áreas que deseja organizar.</p>
        <div className="grid gap-2 md:grid-cols-3">
          {defaultAreas.map((area) => {
            const active = selected.includes(area)
            return (
              <button
                key={area}
                type="button"
                className={`rounded-xl border px-3 py-2 text-sm ${
                  active ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'
                }`}
                onClick={() =>
                  setSelected((previous) =>
                    previous.includes(area)
                      ? previous.filter((item) => item !== area)
                      : [...previous, area],
                  )
                }
              >
                {area}
              </button>
            )
          })}
        </div>
        <Button
          onClick={() => {
            finishOnboarding(selected)
            navigate('/')
          }}
        >
          Concluir onboarding
        </Button>
      </Card>
    </div>
  )
}
