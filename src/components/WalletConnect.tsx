'use client';

import { useState, useEffect } from 'react';
import { SEPOLIA_NETWORK } from '@/constants/contract';
import { checkNetwork } from '@/lib/ethers';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';

interface WalletConnectProps {
  account: string;
  setAccount: (account: string) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export default function WalletConnect({ 
  account, 
  setAccount, 
  isConnected, 
  setIsConnected 
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    if (isConnected) {
      checkNetworkStatus();
    }

    // Escuchar cambios de red
    const handleChainChanged = () => {
      console.log('Network changed in WalletConnect');
      if (isConnected) {
        checkNetworkStatus();
      }
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected]);

  const checkNetworkStatus = async () => {
    const correct = await checkNetwork();
    setIsCorrectNetwork(correct);
  };

  const connectWallet = async () => {
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
        
        // Solo verificar la red, NO cambiar automáticamente
        await checkNetworkStatus();
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

  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    
    // Verificar primero si ya está en Sepolia
    const isCorrect = await checkNetwork();
    if (isCorrect) {
      setIsCorrectNetwork(true);
      console.log('Already on Sepolia network');
      return;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_NETWORK.chainId }],
      });
      setIsCorrectNetwork(true);
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          alert('Error agregando la red Sepolia');
        }
      } else if (error.code === 4001) {
        // Usuario rechazó el cambio
        console.log('User rejected network switch');
      } else {
        console.error('Error switching to Sepolia:', error);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    setIsCorrectNetwork(false);
    
    // Clear localStorage when disconnecting
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_account');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-white">
        <Wallet className="w-6 h-6 mr-2 text-purple-400" />
        Conexión de Wallet
      </h2>
      
      {!isConnected ? (
        <div>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            Conecta tu wallet MetaMask para interactuar con el token SHIFT en Sepolia Testnet.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-purple-400 disabled:to-violet-400 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02]"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Conectando...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Conectar MetaMask
              </>
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <p className="text-sm text-white/60 mb-3">Wallet conectada:</p>
            <div className="glass p-4 rounded-xl">
              <p className="font-mono text-lg font-semibold text-white mb-1">
                {formatAddress(account)}
              </p>
              <p className="text-xs text-white/40 break-all">
                {account}
              </p>
            </div>
          </div>
          
          {!isCorrectNetwork && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-300 text-sm font-medium mb-2">
                    Red incorrecta
                  </p>
                  <p className="text-yellow-200/70 text-xs mb-3">
                    Necesitas estar en Sepolia Testnet para continuar.
                  </p>
                  <button
                    onClick={switchToSepolia}
                    className="text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 px-4 py-2 rounded-lg transition-colors border border-yellow-500/30"
                  >
                    Cambiar a Sepolia
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {isCorrectNetwork && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-300 text-sm font-medium">
                  Conectado a Sepolia Testnet
                </p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center border border-red-500/30 hover:border-red-500/50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Desconectar
          </button>
        </div>
      )}
    </motion.div>
  );
}
