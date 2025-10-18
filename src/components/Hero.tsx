'use client';

import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

interface HeroProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export default function Hero({ onConnect, isConnecting }: HeroProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center px-4 py-2 rounded-full glass mb-8 relative"
          style={{
            filter: 'url(#glass-effect)',
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          <span className="text-white/90 text-sm font-light relative z-10">
            ✨ Powered by Ethereum Sepolia Testnet
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
        >
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Shift Token
          </span>
          <br />
          <span className="text-white/90 font-light">Web3 Experience</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Conecta tu wallet MetaMask para interactuar con el token SHIFT.
          Consulta tu balance, reclama tokens del faucet y transfiere a otras direcciones.
        </motion.p>

        {/* Connect Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="group relative px-8 py-4 rounded-full bg-white text-black font-medium text-base transition-all duration-300 hover:bg-white/90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 shadow-2xl shadow-purple-500/20"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Conectando...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Conectar MetaMask
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </>
            )}
          </button>

          <a
            href="https://sepolia.etherscan.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full bg-transparent border border-white/30 text-white font-medium text-base transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105"
          >
            Ver en Etherscan
          </a>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            {
              icon: '💰',
              title: 'Balance en Tiempo Real',
              description: 'Consulta tu balance de tokens SHIFT actualizado',
            },
            {
              icon: '🚰',
              title: 'Faucet Integrado',
              description: 'Reclama tokens de prueba directamente desde la app',
            },
            {
              icon: '↔️',
              title: 'Transferencias Rápidas',
              description: 'Envía tokens a cualquier dirección de Ethereum',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              className="glass-dark p-6 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/40 text-sm"
        >
          ↓
        </motion.div>
      </motion.div>
    </div>
  );
}


