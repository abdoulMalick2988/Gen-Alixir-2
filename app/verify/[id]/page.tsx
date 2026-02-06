"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  CheckCircle, XCircle, Loader2, FileText, Building, User, 
  Calendar, MapPin, Briefcase, Shield, AlertTriangle,
  ArrowLeft, QrCode, Clock, DollarSign
} from 'lucide-react';
import Link from 'next/link';

// --- INITIALISATION SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
interface ContractData {
  id: string;
  verification_id: string;
  employee_name: string;
  job_title: string;
  contract_type: string;
  document_mode: string;
  company_name: string;
  company_address: string;
  company_rccm: string;
  company_id: string;
  boss_name: string;
  boss_title: string;
  start_date: string;
  end_date: string | null;
  salary: string;
  country: string;
  is_signed: boolean;
  created_at: string;
}

type VerificationStatus = 'loading' | 'verified' | 'not_found' | 'error';

export default function VerifyContractPage() {
  const params = useParams();
  const verificationId = params.id as string;
  
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [contract, setContract] = useState<ContractData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (verificationId) {
      verifyContract();
    }
  }, [verificationId]);

  const verifyContract = async () => {
    setStatus('loading');
    
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('verification_id', verificationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun résultat trouvé
          setStatus('not_found');
        } else {
          console.error('Erreur Supabase:', error);
          setErrorMessage(error.message);
          setStatus('error');
        }
        return;
      }

      if (data) {
        setContract(data);
        setStatus('verified');
      } else {
        setStatus('not_found');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrorMessage('Une erreur est survenue lors de la vérification');
      setStatus('error');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'CDI': return 'Contrat à Durée Indéterminée';
      case 'CDD': return 'Contrat à Durée Déterminée';
      case 'STAGE': return 'Convention de Stage';
      default: return type;
    }
  };

  const getCountryLabel = (country: string) => {
    switch (country) {
      case 'BURUNDI': return '🇧🇮 Burundi';
      case 'SENEGAL': return '🇸🇳 Sénégal';
      default: return country;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Vérification de Contrat
            </h1>
            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest mt-1">
              ECODREUM Engine V1
            </p>
          </div>
        </div>

        {/* ID DE VÉRIFICATION */}
        <div className="mb-6 p-4 bg-zinc-900/50 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
            <QrCode size={14} />
            <span className="font-bold uppercase">ID de Vérification</span>
          </div>
          <p className="font-mono text-sm sm:text-base text-white break-all">{verificationId}</p>
        </div>

        {/* ÉTAT : CHARGEMENT */}
        {status === 'loading' && (
          <div className="text-center py-16">
            <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">Vérification en cours...</p>
            <p className="text-xs text-zinc-600 mt-2">Connexion à la base de données ECODREUM</p>
          </div>
        )}

        {/* ÉTAT : CONTRAT VÉRIFIÉ */}
        {status === 'verified' && contract && (
          <div className="space-y-6">
            {/* BADGE DE VÉRIFICATION */}
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-full">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-emerald-400 uppercase">Contrat Authentique</h2>
                  <p className="text-sm text-emerald-300/80 mt-1">
                    Ce document a été vérifié dans la base de données ECODREUM
                  </p>
                </div>
              </div>
            </div>

            {/* INFORMATIONS DU CONTRAT */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-white/10 bg-white/5">
                <h3 className="font-black uppercase text-sm text-zinc-400 flex items-center gap-2">
                  <FileText size={16} />
                  Détails du Contrat
                </h3>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                {/* Type de contrat */}
                <div className="flex items-start gap-3">
                  <Briefcase size={18} className="text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Type de Contrat</p>
                    <p className="text-white font-semibold">{getContractTypeLabel(contract.contract_type)}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      contract.contract_type === 'CDI' ? 'bg-emerald-500/20 text-emerald-400' :
                      contract.contract_type === 'CDD' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {contract.contract_type}
                    </span>
                  </div>
                </div>

                {/* Employé */}
                <div className="flex items-start gap-3">
                  <User size={18} className="text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">
                      {contract.contract_type === 'STAGE' ? 'Stagiaire' : 'Salarié(e)'}
                    </p>
                    <p className="text-white font-semibold">{contract.employee_name}</p>
                    <p className="text-sm text-zinc-400">{contract.job_title}</p>
                  </div>
                </div>

                {/* Entreprise */}
                <div className="flex items-start gap-3">
                  <Building size={18} className="text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Employeur</p>
                    <p className="text-white font-semibold">{contract.company_name}</p>
                    {contract.company_address && (
                      <p className="text-sm text-zinc-400">{contract.company_address}</p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1">
                      Représenté par {contract.boss_name} ({contract.boss_title})
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Période</p>
                    <p className="text-white">
                      Début : <span className="font-semibold">{formatDate(contract.start_date)}</span>
                    </p>
                    {contract.end_date && (
                      <p className="text-white">
                        Fin : <span className="font-semibold">{formatDate(contract.end_date)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Salaire */}
                {contract.salary && (
                  <div className="flex items-start gap-3">
                    <DollarSign size={18} className="text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">
                        {contract.contract_type === 'STAGE' ? 'Gratification' : 'Rémunération'}
                      </p>
                      <p className="text-white font-semibold">
                        {parseInt(contract.salary).toLocaleString('fr-FR')} {contract.country === 'BURUNDI' ? 'FBu' : 'FCFA'} / mois
                      </p>
                    </div>
                  </div>
                )}

                {/* Juridiction */}
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Juridiction</p>
                    <p className="text-white font-semibold">{getCountryLabel(contract.country)}</p>
                  </div>
                </div>

                {/* Statut de signature */}
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className={contract.is_signed ? 'text-emerald-400' : 'text-zinc-500'} />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Statut</p>
                    <p className={`font-semibold ${contract.is_signed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {contract.is_signed ? '✓ Signé électroniquement' : 'En attente de signature'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Mode : {contract.document_mode === 'ELECTRONIC' ? 'Électronique' : 'Imprimé'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pied de page avec date de création */}
              <div className="p-4 sm:p-6 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock size={12} />
                  <span>Contrat créé le {formatDateTime(contract.created_at)}</span>
                </div>
              </div>
            </div>

            {/* AVERTISSEMENT */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Document Immuable</p>
                  <p className="text-xs text-blue-400/70 mt-1">
                    Les contrats ECODREUM ne peuvent pas être modifiés après leur création. 
                    Ce document est authentique et n'a pas été altéré.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAT : NON TROUVÉ */}
        {status === 'not_found' && (
          <div className="text-center py-12">
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl mb-6">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-red-500/20 rounded-full mb-4">
                  <XCircle size={48} className="text-red-400" />
                </div>
                <h2 className="text-xl font-black text-red-400 uppercase">Contrat Non Trouvé</h2>
                <p className="text-sm text-red-300/80 mt-2 max-w-md">
                  Aucun contrat correspondant à cet identifiant n'a été trouvé dans la base de données ECODREUM.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3 text-left">
                <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-300 font-medium">Attention</p>
                  <p className="text-xs text-amber-400/70 mt-1">
                    Ce document pourrait être frauduleux ou l'identifiant de vérification est incorrect. 
                    Veuillez contacter l'émetteur du document pour vérification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAT : ERREUR */}
        {status === 'error' && (
          <div className="text-center py-12">
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl mb-6">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-red-500/20 rounded-full mb-4">
                  <AlertTriangle size={48} className="text-red-400" />
                </div>
                <h2 className="text-xl font-black text-red-400 uppercase">Erreur de Vérification</h2>
                <p className="text-sm text-red-300/80 mt-2">
                  Une erreur est survenue lors de la connexion à la base de données.
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-400/60 mt-2 font-mono">{errorMessage}</p>
                )}
              </div>
            </div>

            <button 
              onClick={verifyContract}
              className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Système de vérification ECODREUM Engine V1
          </p>
          <p className="text-[9px] text-zinc-700 mt-1">
            © {new Date().getFullYear()} ECODREUM - Tous droits réservés
          </p>
        </div>

      </div>
    </div>
  );
}
