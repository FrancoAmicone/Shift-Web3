'use client';

import { useState, useEffect } from 'react';
import { getClaimStatus, claimTokens } from '@/lib/contract';
import { waitForTransaction } from '@/lib/ethers';
import { ClaimStatus, TransactionStatus } from '@/types';
import { motion } from 'framer-motion';
import { Gift, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ClaimButtonProps {
  account: string;
  onClaimSuccess?: () => void;
}

export default function ClaimButton({ account, onClaimSuccess }: ClaimButtonProps) {
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (account) {
      fetchClaimStatus();
    }
  }, [account]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (claimStatus && !claimStatus.canClaim && claimStatus.timeUntilNextClaim > 0) {
      setCountdown(claimStatus.timeUntilNextClaim);
      
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchClaimStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [claimStatus]);

  const fetchClaimStatus = async () => {
    try {
      setLoading(true);
      const status = await getClaimStatus(account);
      setClaimStatus(status);
    } catch (err: any) {
      console.error('Error fetching claim status:', err);
      setTxStatus({
        status: 'error',
        message: 'Error obteniendo estado del faucet'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!claimStatus?.canClaim) return;

    try {
      setTxStatus({ status: 'pending', message: 'Preparando transacción...' });

      const tx = await claimTokens();
      
      setTxStatus({
        status: 'pending',
        message: 'Transacción enviada. Esperando confirmación...',
        hash: tx.hash
      });

      await waitForTransaction(tx.hash);

      setTxStatus({
        status: 'success',
        message: '¡Tokens reclamados exitosamente!',
        hash: tx.hash
      });

      // Refresh claim status after successful claim
      setTimeout(() => {
        fetchClaimStatus();
        if (onClaimSuccess) {
          onClaimSuccess();
        }
        setTxStatus({ status: 'idle' });
      }, 3000);

    } catch (err: any) {
      console.error('Error claiming tokens:', err);
      let errorMessage = 'Error reclamando tokens';
      
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setTxStatus({
        status: 'error',
        message: errorMessage
      });

      setTimeout(() => {
        setTxStatus({ status: 'idle' });
      }, 5000);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-dark rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
          <Gift className="w-6 h-6 mr-2 text-purple-400" />
          Faucet de Tokens
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          <span className="ml-3 text-white/60">Cargando estado...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-dark rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
        <Gift className="w-6 h-6 mr-2 text-purple-400" />
        Faucet de Tokens
      </h2>

      {claimStatus && (
        <div className="space-y-6">
          {/* Claim Info */}
          <div className="glass-dark p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Cantidad por claim:</span>
              <span className="font-semibold text-white">{claimStatus.faucetAmount} SHIFT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Cooldown:</span>
              <span className="font-semibold text-white">{claimStatus.claimInterval / 3600}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Último claim:</span>
              <span className="font-semibold text-white">
                {claimStatus.lastClaimed > 0 
                  ? new Date(claimStatus.lastClaimed * 1000).toLocaleString('es-ES')
                  : 'Nunca'}
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {txStatus.status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3"
            >
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-medium">Procesando</p>
                <p className="text-blue-200/70 text-xs mt-1">{txStatus.message}</p>
              </div>
            </motion.div>
          )}

          {txStatus.status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
            >
              <div className="flex items-start gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-purple-300 text-sm font-medium">Minando transacción</p>
                  <p className="text-purple-200/70 text-xs mt-1">{txStatus.message}</p>
                </div>
              </div>
              {txStatus.hash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txStatus.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-300 hover:text-purple-200 underline break-all"
                >
                  Ver en Etherscan →
                </a>
              )}
            </motion.div>
          )}

          {txStatus.status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 text-sm font-medium">¡Éxito!</p>
                  <p className="text-green-200/70 text-xs mt-1">{txStatus.message}</p>
                </div>
              </div>
              {txStatus.hash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txStatus.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-300 hover:text-green-200 underline break-all"
                >
                  Ver en Etherscan →
                </a>
              )}
            </motion.div>
          )}

          {txStatus.status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">Error</p>
                <p className="text-red-200/70 text-xs mt-1">{txStatus.message}</p>
              </div>
            </motion.div>
          )}

          {/* Claim Button or Countdown */}
          {claimStatus.canClaim ? (
            <button
              onClick={handleClaim}
              disabled={txStatus.status !== 'idle'}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-purple-400 disabled:to-violet-400 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:scale-100"
            >
              <Gift className="w-5 h-5 mr-2" />
              Reclamar {claimStatus.faucetAmount} SHIFT
            </button>
          ) : (
            <div className="glass-dark p-6 rounded-xl border border-white/10 text-center">
              <Clock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-2">Próximo claim disponible en:</p>
              <p className="text-3xl font-bold text-white mb-1">{formatTime(countdown)}</p>
              <p className="text-xs text-white/40">
                El faucet tiene un cooldown de {claimStatus.claimInterval / 3600} horas
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
