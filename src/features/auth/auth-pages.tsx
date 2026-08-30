import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button, Card, Input } from '../../components/ui'
import { useAppStore } from '../../store/app-store'

export const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)
  const currentUser = useAppStore((state) => state.currentUser)
  const [email, setEmail] = useState('demo@financas.app')
  const [password, setPassword] = useState('123456')

  if (currentUser) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-4">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" />
        <Input
          value={password}
          type="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha"
        />
        <Button
          className="w-full"
          onClick={() => {
            const ok = login({ email, password })
            if (!ok) {
              toast.error('Usuária não encontrada')
              return
            }
            toast.success('Bem-vinda!')
            navigate('/')
          }}
        >
          Login
        </Button>
        <p className="text-sm text-slate-500">
          Não possui conta? <Link className="text-indigo-600" to="/register">Cadastre-se</Link>
        </p>
      </Card>
    </div>
  )
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const register = useAppStore((state) => state.register)
  const currentUser = useAppStore((state) => state.currentUser)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  if (currentUser) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-4">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome" />
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" />
        <Button
          className="w-full"
          onClick={() => {
            if (!name || !email) {
              toast.error('Preencha nome e e-mail')
              return
            }
            register(name, email)
            toast.success('Conta criada')
            navigate('/onboarding')
          }}
        >
          Cadastrar
        </Button>
      </Card>
    </div>
  )
}

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const currentUser = useAppStore((state) => state.currentUser)
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return children
}
