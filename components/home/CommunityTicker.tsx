'use client'

import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'

// Données de démonstration (seront remplacées par les vraies notifications en PARTIE 5)
const mockNotifications = [
  { id: '1', type: 'goal', message: 'GOAL – Projet EcoPay (Équipe A)' },
  { id: '2', type: 'rejet', message: 'Projet CryptoHub rejeté' },
  { id: '3', type: 'nouveau_projet', message: 'Nouveau projet créé : GreenTech' },
  { id: '4', type: 'nouveau_membre', message: 'Nouveau membre : Jean Dupont' },
  { id: '5', type: 'goal', message: 'GOAL – Projet AfriMarket (Équipe B)' },
]

export default function CommunityTicker() {
  const [notifications, setNotifications] = useState(mockNotifications)
  
  // Double le tableau pour un défilement infini sans blanc
  const duplicatedNotifications = [...notifications, ...notifications]
  
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'goal':
        return 'success'
      case 'rejet':
        return 'error'
      case 'nouveau_projet':
        return 'info'
      case 'nouveau_membre':
        return 'warning'
      default:
        return 'neutral'
    }
  }
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '⚽'
      case 'rejet':
        return '🔴'
      case 'nouveau_projet':
        return '✨'
      case 'nouveau_membre':
        return '👤'
      default:
        return '📢'
    }
  }
  
  return (
    <div className="bg-black/50 backdrop-blur-sm border-y border-white/10 py-4 overflow-hidden">
      <div className="flex animate-scroll">
        {duplicatedNotifications.map((notification, index) => (
          <div
            key={`${notification.id}-${index}`}
            className="flex-shrink-0 mx-4 cursor-pointer hover:scale-105 transition-transform"
          >
            <Badge variant={getBadgeVariant(notification.type)} size="lg">
              <span className="mr-2">{getIcon(notification.type)}</span>
              {notification.message}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
