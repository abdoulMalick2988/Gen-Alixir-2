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
  const ADMIN_PASSWORD = 'GenAlixir777' // À changer et à sécuriser !

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
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
      setAuthError('')
      loadAdhesions()
    } else {
      setAuthError('Mot de passe incorrect')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    router.push('/')
  }

  const loadAdhesions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('adhesion_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'tous') {
        query = query.eq('statut', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setAdhesions(data || [])
    } catch (error) {
      console.error('Erreur loadAdhesions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadAdhesions()
    }
  }, [filter, isAuthenticated])

  const handleValidate = async (adhesionId: string, email: string) => {
    if (!adminEmail) {
      alert('Veuillez entrer votre email admin')
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir valider cette demande ?')) {
      return
    }

    setProcessingId(adhesionId)
    try {
      // Appeler la fonction SQL pour créer le membre
      const { data, error } = await supabase.rpc('create_member_from_adhesion', {
        adhesion_id: adhesionId,
        validated_by: adminEmail
      })

      if (error) throw error

      // Récupérer les infos du nouveau membre (GEN ID + PIN)
      const { data: memberData, error: memberError } = await supabase
        .from('members_profiles')
        .select('gen_alixir_id, pin_code, email')
        .eq('id', data)
        .single()

      if (memberError) throw memberError

      // Afficher les infos pour l'envoi de l'email
      setValidationResult({
        genId: memberData.gen_alixir_id,
        pin: memberData.pin_code,
        email: memberData.email
      })

      // Recharger la liste
      loadAdhesions()
    } catch (error: any) {
      alert('Erreur lors de la validation: ' + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (adhesionId: string) => {
    const motif = prompt('Motif du rejet (optionnel):')
    
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) {
      return
    }

    setProcessingId(adhesionId)
    try {
      const { error } = await supabase
        .from('adhesion_requests')
        .update({
          statut: 'rejete',
          valide_par: adminEmail,
          date_validation: new Date().toISOString(),
          motif_rejet: motif
        })
        .eq('id', adhesionId)

      if (error) throw error

      loadAdhesions()
      alert('Demande rejetée avec succès')
    } catch (error: any) {
      alert('Erreur lors du rejet: ' + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copié dans le presse-papier !')
  }

  const getEmailTemplate = (result: { genId: string; pin: string; email: string }) => {
    return `Objet : Bienvenue dans GEN ALIXIR ! 🎉

Bonjour,

Félicitations ! Votre demande d'adhésion à GEN ALIXIR a été validée.

Voici vos identifiants de connexion :
- ID GEN ALIXIR : ${result.genId}
- Code PIN : ${result.pin}

Vous pouvez vous connecter sur : ${window.location.origin}/login

⚠️ Important :
- Conservez précieusement votre Code PIN
- Ce code est personnel et non modifiable
- Pour toute demande de modification, contactez-nous à support@genalixir.com

Bienvenue dans la communauté !

L'équipe GEN ALIXIR`
  }

  // Écran de connexion admin
  if (!isAuthenticated) {
    return (
      <Section containerSize="sm" className="min-h-screen flex items-center">
        <Card glow className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Administration <span className="text-emerald-400">GEN ALIXIR</span>
          </h1>
          
          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400">{authError}</p>
            </div>
          )}
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe administrateur
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button variant="primary" fullWidth type="submit">
              Se connecter
            </Button>
          </form>
        </Card>
      </Section>
    )
  }

  return (
    <Section containerSize="xl" className="min-h-screen py-20">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Administration <span className="text-emerald-400">GEN ALIXIR</span>
            </h1>
            <p className="text-gray-400">Gestion des demandes d'adhésion</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>

        {/* Email Admin */}
        <Card>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Votre email admin (pour traçabilité)
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="admin@genalixir.com"
          />
        </Card>

        {/* Résultat de validation */}
        {validationResult && (
          <Card glow className="bg-emerald-500/10 border-emerald-500/30">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-white">✅ Validation réussie !</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setValidationResult(null)}
                >
                  Fermer
                </Button>
              </div>

              <div className="bg-black/30 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <div className="text-white font-mono flex justify-between items-center">
                    <span>{validationResult.email}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(validationResult.email)}
                    >
                      Copier
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">ID GEN ALIXIR</div>
                  <div className="text-emerald-400 text-xl font-bold font-mono flex justify-between items-center">
                    <span>{validationResult.genId}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(validationResult.genId)}
                    >
                      Copier
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Code PIN</div>
                  <div className="text-emerald-400 text-xl font-bold font-mono flex justify-between items-center">
                    <span>{validationResult.pin}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(validationResult.pin)}
                    >
                      Copier
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">📧 Template Email</h3>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => copyToClipboard(getEmailTemplate(validationResult))}
                  >
                    Copier le template
                  </Button>
                </div>
                <pre className="bg-black/30 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {getEmailTemplate(validationResult)}
                </pre>
              </div>
            </div>
          </Card>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-4">
          <Button
            variant={filter === 'en_attente' ? 'primary' : 'outline'}
            onClick={() => setFilter('en_attente')}
          >
            En attente ({adhesions.filter(a => a.statut === 'en_attente').length})
          </Button>
          <Button
            variant={filter === 'valide' ? 'primary' : 'outline'}
            onClick={() => setFilter('valide')}
          >
            Validées
          </Button>
          <Button
            variant={filter === 'rejete' ? 'primary' : 'outline'}
            onClick={() => setFilter('rejete')}
          >
            Rejetées
          </Button>
          <Button
            variant={filter === 'tous' ? 'primary' : 'outline'}
            onClick={() => setFilter('tous')}
          >
            Toutes ({adhesions.length})
          </Button>
        </div>

        {/* Liste des demandes */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-white text-xl">Chargement...</div>
            </div>
          </Card>
        ) : adhesions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl">Aucune demande pour ce filtre</div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {adhesions.map((adhesion) => {
              const auraInfo = AURA_TYPES.find(a => a.value === adhesion.aura_dominante)
              const isProcessing = processingId === adhesion.id

              return (
                <Card key={adhesion.id} glow={adhesion.statut === 'en_attente'}>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Informations */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            {adhesion.prenom} {adhesion.nom}
                          </h3>
                          <p className="text-gray-400">{adhesion.email}</p>
                        </div>
                        <Badge
                          variant={
                            adhesion.statut === 'en_attente'
                              ? 'warning'
                              : adhesion.statut === 'valide'
                              ? 'success'
                              : 'error'
                          }
                        >
                          {adhesion.statut === 'en_attente' && 'En attente'}
                          {adhesion.statut === 'valide' && 'Validée'}
                          {adhesion.statut === 'rejete' && 'Rejetée'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Pays:</span>
                          <span className="text-white ml-2">{adhesion.pays}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Pôle:</span>
                          <span className="text-white ml-2">{adhesion.pole_competence}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Aura:</span>
                          <span className="text-white ml-2">
                            {auraInfo?.emoji} {auraInfo?.label}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-2">Compétences:</div>
                        <div className="flex flex-wrap gap-2">
                          {adhesion.skills.map(skill => (
                            <Badge key={skill} variant="info" size="sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="lg:col-span-1 space-y-2 text-sm">
                      <div>
                        <div className="text-gray-400">Demande créée</div>
                        <div className="text-white">
                          {new Date(adhesion.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {adhesion.date_validation && (
                        <>
                          <div>
                            <div className="text-gray-400">Validée le</div>
                            <div className="text-white">
                              {new Date(adhesion.date_validation).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Par</div>
                            <div className="text-white">{adhesion.valide_par}</div>
                          </div>
                        </>
                      )}

                      {adhesion.motif_rejet && (
                        <div>
                          <div className="text-gray-400">Motif rejet</div>
                          <div className="text-red-400">{adhesion.motif_rejet}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-3">
                      {adhesion.statut === 'en_attente' && (
                        <>
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() => handleValidate(adhesion.id, adhesion.email)}
                            disabled={isProcessing || !adminEmail}
                          >
                            {isProcessing ? 'Validation...' : '✅ Valider'}
                          </Button>
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={() => handleReject(adhesion.id)}
                            disabled={isProcessing || !adminEmail}
                          >
                            {isProcessing ? 'Traitement...' : '❌ Rejeter'}
                          </Button>
                        </>
                      )}
                      {adhesion.statut === 'valide' && (
                        <Badge variant="success" size="lg">
                          ✅ Membre validé
                        </Badge>
                      )}
                      {adhesion.statut === 'rejete' && (
                        <Badge variant="error" size="lg">
                          ❌ Demande rejetée
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </Section>
  )
}
