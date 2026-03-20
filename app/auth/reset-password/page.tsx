'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
      const [error, setError] = useState<string | null>(null)
        const router = useRouter()
          const supabase = createClient()
          
            useEffect(() => {
                supabase.auth.getSession().then(({ data }) => {
                      if (!data.session) {
                              setError('Link inválido ou expirado')
                                    }
                                        })
                                          }, [supabase])
                                          
                                            async function handleSubmit(e: React.FormEvent) {
                                                e.preventDefault()
                                                    if (password !== confirmPassword) {
                                                          setError('As senhas não coincidem')
                                                                return
                                                                    }
                                                                    
                                                                        await supabase.auth.updateUser({ password })
                                                                            router.push('/login')
                                                                              }
                                                                              
                                                                                return (
                                                                                    <form onSubmit={handleSubmit}>
                                                                                          <input type="password" onChange={(e) => setPassword(e.target.value)} />
                                                                                                <input type="password" onChange={(e) => setConfirmPassword(e.target.value)} />
                                                                                                      <button type="submit">Salvar</button>
                                                                                                            {error && <p>{error}</p>}
                                                                                                                </form>
                                                                                                                  )
                                                                                                                  }'