'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (!supabase) throw new Error('Supabase não configurado.')

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        redirectTo: `${baseUrl}/auth/reset-password`,
      })

      if (error) throw error

      setMessage('Se o email existir, você receberá um link de recuperação.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar link de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Recuperar senha</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Informe seu email para receber o link de redefinição.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5 text-slate-900 dark:text-white"
              placeholder="seu@email.com"
            />
          </div>

          {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white py-3 font-semibold"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          <Link href="/login" className="text-primary-600 hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
