"use client"
import { useEffect, useState, ComponentType, FC } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

export function withAuth<P extends object>(Component: ComponentType<P>): FC<P> {
  return function ProtectedComponent(props: P)  {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
      const checkAuth = async () => {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          router.push('/auth')
        } else {
          setAuthenticated(true)
        }
        setLoading(false)
      }

      checkAuth()
    }, [router])

    if (loading) return <p>Loading...</p>
    if (!authenticated) return null

    return <Component {...props} />
  }
}
