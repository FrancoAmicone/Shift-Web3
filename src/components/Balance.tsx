'use client';

import { useState, useEffect } from 'react';
import { getTokenBalance, getTokenInfo } from '@/lib/contract';
import { TokenBalance } from '@/types';
import { motion } from 'framer-motion';
import { Coins, RefreshCw, TrendingUp } from 'lucide-react';

interface BalanceProps {
  account: string;
}

export default function Balance({ account }: BalanceProps) {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (account) {
      fetchBalance();
      fetchTokenInfo();
    }
  }, [account]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError('');
      const balanceData = await getTokenBalance(account);
      setBalance(balanceData);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      setError('Error obteniendo el balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenInfo = async () => {
    try {
      const info = await getTokenInfo();
      setTokenInfo(info);
    } catch (err: any) {
      console.error('Error fetching token info:', err);
    }
  };

  const refreshBalance = async () => {
    setIsRefreshing(true);
    await fetchBalance();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
          <Coins className="w-6 h-6 mr-2 text-purple-400" />
          Balance de Tokens
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-white/60">Cargando balance...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
          <Coins className="w-6 h-6 mr-2 text-purple-400" />
          Balance de Tokens
        </h2>
        <div className="text-center py-12">
          <p className="text-red-400 mb-6">❌ {error}</p>
          <button
            onClick={refreshBalance}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Reintentar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-dark rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center">
          <Coins className="w-6 h-6 mr-2 text-purple-400" />
          Balance de Tokens
        </h2>
        <button
          onClick={refreshBalance}
          disabled={isRefreshing}
          className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
          title="Actualizar balance"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {balance && (
        <div className="space-y-6">
          {/* Main Balance Display */}
          <div className="text-center py-6 glass-dark rounded-xl border border-white/10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-3"
            >
              {parseFloat(balance.formatted).toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
              })}
            </motion.div>
            <div className="text-lg text-white/70 font-medium">
              {tokenInfo?.symbol || 'SHIFT'} Tokens
            </div>
          </div>
          
          {/* Token Info Grid */}
          {tokenInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-white/50">Nombre</span>
                </div>
                <span className="font-medium text-white">{tokenInfo.name}</span>
              </div>
              
              <div className="glass-dark p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-white/50">Símbolo</span>
                </div>
                <span className="font-medium text-white">{tokenInfo.symbol}</span>
              </div>
              
              <div className="glass-dark p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-white/50">Decimales</span>
                </div>
                <span className="font-medium text-white">{tokenInfo.decimals}</span>
              </div>
              
              <div className="glass-dark p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-white/50">Supply Total</span>
                </div>
                <span className="font-medium text-white">
                  {parseFloat(tokenInfo.totalSupply).toLocaleString('es-ES', {
                    maximumFractionDigits: 0
                  })}
                </span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-white/30 text-center pt-4 border-t border-white/10">
            Balance exacto: {balance.balance} wei
          </div>
        </div>
      )}
    </motion.div>
  );
}
