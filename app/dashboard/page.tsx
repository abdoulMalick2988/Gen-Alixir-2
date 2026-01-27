'use client';

// GEN ALIXIR - Dashboard Page
// Espace membre principal (Phase 1)

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROLE_DESCRIPTIONS, getPcoLevel, AVAILABLE_SKILLS, AVAILABLE_AURA } from '@/types';
import { getInitials, getAvatarColor, formatDate } from '@/lib/utils';
import Input from '@/components/ui/Input';

function DashboardContent() {
  const { user, profile, logout, updateProfile } = useAuth();
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingAura, setIsEditingAura] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills || []);
  const [selectedAura, setSelectedAura] = useState<string[]>(profile?.aura || []);

  if (!user || !profile) return null;

  const roleData = ROLE_DESCRIPTIONS[user.role];
  const pcoLevel = getPcoLevel(profile.pco);

  async function handleSaveSkills() {
    try {
      await updateProfile({ skills: selectedSkills });
      setIsEditingSkills(false);
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  }

  async function handleSaveAura() {
    try {
      await updateProfile({ aura: selectedAura });
      setIsEditingAura(false);
    } catch (error) {
      console.error('Error updating aura:', error);
    }
  }

  function toggleSkill(skill: string) {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 3) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  }

  function toggleAura(aura: string) {
    if (selectedAura.includes(aura)) {
      setSelectedAura(selectedAura.filter(a => a !== aura));
    } else if (selectedAura.length < 3) {
      setSelectedAura([...selectedAura, aura]);
    }
  }

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue, {profile.full_name}
            </h1>
            <p className="text-gray-600">
              Membre depuis {formatDate(user.created_at)}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Déconnexion
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte Membre */}
            <Card>
              <CardHeader>
                <CardTitle>Carte Membre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-sm opacity-90 mb-1">GEN ALIXIR</p>
                      <h3 className="text-2xl font-bold">{profile.full_name}</h3>
                    </div>
                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(profile.full_name)} flex items-center justify-center text-2xl font-bold`}>
                      {getInitials(profile.full_name)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Rôle</p>
                      <p className="font-semibold">{roleData.title}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75 mb-1">Pays</p>
                      <p className="font-semibold">{profile.country}</p>
                    </div>
                  </div>

                  <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-75 mb-1">Points PCO</p>
                        <p className="text-3xl font-bold">{profile.pco}</p>
                      </div>
                      <Badge className="bg-white/30 text-white border-white/50">
                        {pcoLevel.title}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SKILLS */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>💡</span> SKILLS
                    </CardTitle>
                    <CardDescription>Vos compétences techniques (max 3)</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isEditingSkills ? handleSaveSkills() : setIsEditingSkills(true)}
                  >
                    {isEditingSkills ? 'Enregistrer' : 'Modifier'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingSkills ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">
                      Sélectionnez jusqu'à 3 compétences ({selectedSkills.length}/3)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                            selectedSkills.includes(skill)
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <Badge key={skill} variant="info">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Aucune compétence définie</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AURA */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>✨</span> AURA
                      {profile.aura_verified && (
                        <Badge variant="success" className="ml-2">
                          ✓ Vérifié
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Vos traits de caractère (max 3)</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isEditingAura ? handleSaveAura() : setIsEditingAura(true)}
                  >
                    {isEditingAura ? 'Enregistrer' : 'Modifier'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingAura ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">
                      Sélectionnez jusqu'à 3 traits ({selectedAura.length}/3)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_AURA.map((aura) => (
                        <button
                          key={aura}
                          onClick={() => toggleAura(aura)}
                          className={`p-2 text-sm rounded-lg border-2 transition-colors ${
                            selectedAura.includes(aura)
                              ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {aura}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.aura.length > 0 ? (
                      profile.aura.map((aura) => (
                        <Badge key={aura} variant="warning">
                          {aura}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Aucun trait défini</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rôle</p>
                  <Badge>{roleData.title}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Niveau PCO</p>
                  <Badge variant="success">{pcoLevel.title}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progression */}
            <Card>
              <CardHeader>
                <CardTitle>Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>PCO actuel</span>
                      <span className="font-bold">{profile.pco}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((profile.pco / 150) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {pcoLevel.min === 0 ? 'Commencez' : 'Continuez'} à contribuer pour progresser !
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prochaine phase */}
            <Card className="bg-gradient-to-br from-accent-50 to-purple-50 border-accent-200">
              <CardHeader>
                <CardTitle className="text-accent-900">🔮 Prochainement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-accent-800">
                  <li>• Système de projets collaboratifs</li>
                  <li>• Gain de PCO dynamique</li>
                  <li>• Tâches et contributions</li>
                  <li>• Historique détaillé</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
