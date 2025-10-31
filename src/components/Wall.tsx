'use client';

import { useState, useEffect } from 'react';
import { getMessages, getMessageCount, getUserStats, listenToUserStatsUpdated, listenToDailyRewards } from '@/lib/wall';
import { WallMessage, UserStats, DailyReward } from '@/types';
import SendMessage from './SendMessage';

interface WallProps {
  refreshTrigger?: number;
}

export default function Wall({ refreshTrigger = 0 }: WallProps) {
  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [messageCount, setMessageCount] = useState(0);
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([]);

  useEffect(() => {
    fetchMessages();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 10000);

    // Set up event listeners
    const unsubscribeStats = listenToUserStatsUpdated((stats) => {
      setUserStats(prev => ({
        ...prev,
        [stats.address]: stats
      }));
    });

    const unsubscribeRewards = listenToDailyRewards((reward) => {
      setDailyRewards(prev => {
        const newRewards = prev.filter(r => r.position !== reward.position);
        return [...newRewards, reward].sort((a, b) => a.position - b.position);
      });
    });
    
    return () => {
      clearInterval(interval);
      unsubscribeStats();
      unsubscribeRewards();
    };
  }, [refreshTrigger]);

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      
      const [msgs, count] = await Promise.all([
        getMessages(),
        getMessageCount()
      ]);
      
      setMessages(msgs);
      setMessageCount(count);

      // Fetch stats for unique senders
      const uniqueSenders = Array.from(new Set(msgs.map(m => m.sender)));
      const stats = await Promise.all(uniqueSenders.map(getUserStats));
      
      const statsMap = stats.reduce((acc, stat) => {
        acc[stat.address] = stat;
        return acc;
      }, {} as Record<string, UserStats>);
      
      setUserStats(statsMap);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Error cargando mensajes');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDailyLeaderboard = () => {
    return Object.values(userStats)
      .sort((a, b) => b.dailyMessages - a.dailyMessages)
      .filter(user => user.dailyMessages > 0)
      .slice(0, 10); // Top 10 users
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="glass-dark rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🧱 Shift Wall</h2>
          <span className="text-sm text-white/60">Cargando...</span>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-dark rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">🧱 Shift Wall</h2>
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">❌ {error}</p>
          <button
            onClick={() => fetchMessages()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🧱 Shift Wall</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">
            {messageCount} {messageCount === 1 ? 'mensaje' : 'mensajes'}
          </span>
          <button
            onClick={() => fetchMessages()}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            title="Actualizar mensajes"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Daily Rewards Section */}
      {dailyRewards.length > 0 && (
        <div className="glass-dark rounded-xl p-4 mb-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">🏆 Top 3 del día</h3>
          <div className="space-y-2">
            {dailyRewards.map((reward) => (
              <div key={reward.position} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {reward.position === 0 ? "🥇" : reward.position === 1 ? "🥈" : "🥉"}
                  </span>
                  <span className="font-mono text-white/80">{formatAddress(reward.user)}</span>
                </div>
                <span className="text-purple-400 font-medium">{reward.amount} SHIFT</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Leaderboard Section */}
      {getDailyLeaderboard().length > 0 && (
        <div className="glass-dark rounded-xl p-4 mb-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">📊 Ranking de mensajes del día</h3>
          <div className="space-y-2">
            {getDailyLeaderboard().map((user, index) => (
              <div key={user.address} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white/50 w-6">#{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-white/80">
                        {formatAddress(user.address)}
                      </p>
                      <p className="text-xs text-purple-400">
                        {user.dailyMessages} mensajes hoy
                      </p>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/address/${user.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-purple-400 text-xs"
                  title="Ver en Etherscan"
                >
                  🔗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Message Form */}
      <SendMessage onMessageSent={() => fetchMessages()} />

      {/* Messages List */}
      <h2 className="text-2xl font-semibold mt-8 mb-6 text-white flex items-center">
        💬 Mensajes
        <span className="ml-3 text-sm font-normal text-white/60">
          {messageCount} {messageCount === 1 ? 'mensaje' : 'mensajes'}
        </span>
      </h2>

      {messages.length === 0 ? (
        <div className="text-center py-12 glass-dark rounded-xl border border-white/10">
          <div className="text-4xl mb-4">🤔</div>
          <p className="text-white/90 font-medium mb-2">
            No hay mensajes todavía
          </p>
          <p className="text-white/60 text-sm">
            ¡Sé el primero en publicar un mensaje en el muro!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <div
              key={`${message.sender}-${message.timestamp}-${index}`}
              className="glass-dark rounded-xl p-4 hover:border-purple-500/30 transition-all border border-white/10"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {message.sender.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-mono text-xs text-white/80">
                      {formatAddress(message.sender)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white/50">
                        {formatTimestamp(message.timestamp)}
                      </p>
                      {userStats[message.sender] && (
                        <p className="text-xs text-purple-400">
                          {userStats[message.sender].dailyMessages} hoy · {userStats[message.sender].totalMessages} total
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/address/${message.sender}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-purple-400 text-xs"
                  title="Ver en Etherscan"
                >
                  🔗
                </a>
              </div>
              
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Actualización automática cada 10s</span>
          <span>💰 Costo: 1 SHIFT por mensaje</span>
        </div>
      </div>
    </div>
  );
}
