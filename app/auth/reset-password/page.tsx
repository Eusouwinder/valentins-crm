'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function validateSession() {
      const { data } = await (supabase as any).auth.getSession()

      if (!data.session) {
        setError('Link inválido ou expirado')
        return
      }

      setReady(true)
    }

    validateSession()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!ready) {
      setError('Sessão inválida')
      return
    }

    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    try {
      setLoading(true)

      const { error } = await (supabase as any).auth.updateUser({
        password,
      })

      if (error) throw error

      setSuccess('Senha atualizada com sucesso')

      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">Redefinir senha</h1>

        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <button className="w-full bg-black text-white p-2 rounded">
          {loading ? 'Atualizando...' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
