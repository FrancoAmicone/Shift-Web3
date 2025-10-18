'use client';

import { useState, useEffect } from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Hero from '@/components/Hero';
import WalletConnect from '@/components/WalletConnect';
import Balance from '@/components/Balance';
import ClaimButton from '@/components/ClaimButton';
import TransferForm from '@/components/TransferForm';
import Wall from '@/components/Wall';
import PostMessageForm from '@/components/PostMessageForm';
import { CONTRACT_ADDRESS } from '@/constants/contract';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    initializeConnection();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      // Delay showing content for smooth transition
      setTimeout(() => setShowContent(true), 500);
    } else {
      setShowContent(false);
    }
  }, [isConnected]);

  const initializeConnection = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if user was previously connected (from localStorage)
      const wasConnected = localStorage.getItem('wallet_connected') === 'true';
      const savedAccount = localStorage.getItem('wallet_account');
      
      if (wasConnected && savedAccount && window.ethereum) {
        // Only check current accounts, don't request connection
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          // Clear saved data if accounts don't match
          localStorage.removeItem('wallet_connected');
          localStorage.removeItem('wallet_account');
        }
      }
    } catch (error) {
      console.error('Error initializing connection:', error);
      // Clear saved data on error
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('wallet_account');
    } finally {
      setIsInitialized(true);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount('');
      setIsConnected(false);
      // Clear localStorage when disconnected
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('wallet_account');
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      // Save to localStorage when account changes
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('wallet_account', accounts[0]);
      refreshData();
    }
  };

  const handleChainChanged = () => {
    // Refresh the page when chain changes
    window.location.reload();
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const refreshWall = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleConnect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Por favor instala MetaMask para continuar!');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Save connection to localStorage
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_account', accounts[0]);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Conexión rechazada por el usuario');
      } else {
        alert('Error conectando la wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if contract address is configured
  const isContractConfigured = CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '';

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white/60">Inicializando conexión...</p>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <AnimatePresence mode="wait">
        {!isConnected ? (
          // Hero Section + Public Wall
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Hero onConnect={handleConnect} isConnecting={isConnecting} />
            
            {/* Public Wall Section - Visible to everyone */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="inline-flex items-center px-4 py-2 rounded-full glass mb-4"
                  >
                    <span className="text-white/80 text-sm font-light">
                      💬 Comunidad Descentralizada
                    </span>
                  </motion.div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    🧱 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Muro Público
                    </span>
                  </h2>
                  <p className="text-white/60 text-lg max-w-2xl mx-auto mb-2">
                    Mensajes inmutables guardados en la blockchain de Sepolia
                  </p>
                  <p className="text-purple-400 text-sm font-medium">
                    💡 Conecta tu wallet arriba para publicar tu propio mensaje por 1 SHIFT
                  </p>
                </div>
                
                <Wall refreshTrigger={refreshKey} />
                
                {/* CTA to Connect */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="text-center mt-12"
                >
                  <div className="glass-dark rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      ¿Quieres publicar tu mensaje? 💬
                    </h3>
                    <p className="text-white/60 mb-6">
                      Conecta tu wallet para participar en el muro descentralizado
                    </p>
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-base transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isConnecting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Conectando...
                        </div>
                      ) : (
                        'Conectar Wallet →'
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Footer for Public Page */}
            <footer className="backdrop-blur-sm bg-white/5 border-t border-white/10 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-white/50">
                  <p className="mb-2">
                    🔗 Desplegado en Sepolia Testnet • Código 100% Open Source
                  </p>
                  <p className="text-sm">
                    Construido con Next.js, TypeScript, ethers.js y TailwindCSS
                  </p>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          // Main Content
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            {/* Header */}
            <header className="relative z-20 backdrop-blur-sm bg-white/5 border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      🚀 Shift Token Web3
                    </h1>
                    <p className="text-sm text-white/60">
                      Conectado a Sepolia Testnet
                    </p>
                  </div>
                  {isContractConfigured && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                      ✅ Contrato configurado
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Public Wall Section - Visible to everyone */}
              {isContractConfigured && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-12"
                >
                  <Wall refreshTrigger={refreshKey} />
                </motion.div>
              )}

              {!isContractConfigured ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="glass-dark border border-yellow-500/30 rounded-2xl p-8 text-center">
                    <div className="text-yellow-400 text-4xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-semibold text-yellow-300 mb-3">
                      Configuración Requerida
                    </h2>
                    <p className="text-white/70 mb-6">
                      Para usar la aplicación, necesitas configurar la dirección del contrato desplegado.
                    </p>
                    <div className="glass rounded-xl p-6 text-left">
                      <p className="text-sm text-white/60 mb-3">
                        Crea un archivo <code className="bg-white/10 px-2 py-1 rounded">.env.local</code> en la raíz del proyecto con:
                      </p>
                      <pre className="bg-black/40 p-4 rounded-lg text-sm overflow-x-auto text-white/80 font-mono">
{`NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID`}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {/* Dashboard Section Title */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showContent ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-2">📊 Tu Dashboard</h2>
                    <p className="text-white/60">Gestiona tus tokens SHIFT y publica mensajes</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showContent ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid gap-8 lg:grid-cols-2"
                  >
                    {/* Left Column */}
                    <div className="space-y-6">
                      <WalletConnect 
                        account={account}
                        setAccount={setAccount}
                        isConnected={isConnected}
                        setIsConnected={setIsConnected}
                      />
                      
                      {isConnected && (
                        <>
                          <Balance 
                            key={`balance-${refreshKey}`}
                            account={account} 
                          />
                          <PostMessageForm 
                            account={account}
                            onPostSuccess={refreshWall}
                          />
                        </>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {isConnected && (
                        <>
                          <ClaimButton 
                            key={`claim-${refreshKey}`}
                            account={account}
                            onClaimSuccess={refreshData}
                          />
                          <TransferForm 
                            account={account}
                            onTransferSuccess={refreshData}
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Contract Info */}
              {isContractConfigured && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-12 max-w-4xl mx-auto"
                >
                  <div className="glass-dark rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-semibold mb-6 text-white">📋 Información del Contrato</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-white/60 mb-2">Dirección del Contrato:</p>
                        <p className="font-mono text-sm glass p-3 rounded-lg break-all text-white/90">
                          {CONTRACT_ADDRESS}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60 mb-2">Red:</p>
                        <p className="text-sm font-medium text-white/90 glass p-3 rounded-lg">Sepolia Testnet</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                      >
                        Ver en Etherscan →
                      </a>
                      <a
                        href={`https://sepolia.routescan.io/address/${CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors border border-violet-500/30"
                      >
                        Ver en Routescan →
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </main>

            {/* Footer */}
            <footer className="backdrop-blur-sm bg-white/5 border-t border-white/10 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-white/50">
                  <p className="mb-2">
                    🔗 Desplegado en Sepolia Testnet • Verificado en Sourcify
                  </p>
                  <p className="text-sm">
                    Construido con Next.js, TypeScript, ethers.js y TailwindCSS
                  </p>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedBackground>
  );
}
