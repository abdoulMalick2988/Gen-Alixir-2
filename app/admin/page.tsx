'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabase/client'
import { AURA_TYPES } from '@/lib/constants'

interface AdhesionRequest {
  id: string
  nom: string
  prenom: string
  email: string
  pays: string
  pole_competence: string
  skills: string[]
  aura_dominante: string
  statut: string
  created_at: string
  date_validation: string | null
  valide_par: string | null
  motif_rejet: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adhesions, setAdhesions] = useState<AdhesionRequest[]>([])
  const [filter, setFilter] = useState<'en_attente' | 'valide' | 'rejete' | 'tous'>('en_attente')
  const [adminEmail, setAdminEmail] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<{
    genId: string
    pin: string
    email: string
  } | null>(null)

  // Simple authentification admin (à améliorer en production)
  const ADMIN_PASSWORD = 'GenAlixir2024!' // À changer et à sécuriser !

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_authenticated')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      loadAdhesions()
    } else {
      setLoading(false)
    }
  }, [])

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(
