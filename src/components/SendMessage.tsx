'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { postMessage, checkAllowance, approveTokens, getPostCost } from '@/lib/wall';
import { waitForTransaction } from '@/lib/ethers';
import { TransactionStatus } from '@/types';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

interface SendMessageProps {
  onMessageSent?: () => void;
}

export default function SendMessage({ onMessageSent }: SendMessageProps) {
  const [message, setMessage] = useState('');
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setTxStatus({
        status: 'error',
        message: 'Por favor escribe un mensaje'
      });
      setTimeout(() => setTxStatus({ status: 'idle' }), 3000);
      return;
    }

    if (message.length > 280) {
      setTxStatus({
        status: 'error',
        message: 'El mensaje es demasiado largo (máximo 280 caracteres)'
      });
      setTimeout(() => setTxStatus({ status: 'idle' }), 3000);
      return;
    }

    try {
      setTxStatus({ status: 'pending', message: 'Verificando aprobación...' });

      // Get current account
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No hay cuenta conectada');
      }
      const currentAccount = accounts[0];

      // Get post cost and check allowance
      const cost = await getPostCost();
      const allowance = await checkAllowance(currentAccount);

      // If allowance is less than cost, request approval
      if (allowance < ethers.parseUnits(cost, 18)) {
        setTxStatus({ status: 'pending', message: 'Aprobando tokens...' });
        const approveTx = await approveTokens(cost);
        await waitForTransaction(approveTx.hash);
      }

      setTxStatus({ status: 'pending', message: 'Enviando mensaje...' });
      const txHash = await postMessage(message);
      
      // Mostrar éxito inmediatamente después de enviar la tx
      setTxStatus({
        status: 'success',
        message: '¡Mensaje enviado! Se actualizará en unos segundos.',
        hash: txHash
      });

      // Limpiar el formulario inmediatamente
      setMessage('');

      // Esperar confirmación en segundo plano
      waitForTransaction(txHash).then(() => {
        // Actualizar el muro
        if (onMessageSent) {
          onMessageSent();
        }
        
        // Actualizar mensaje de éxito
        setTxStatus({
          status: 'success',
          message: '¡Mensaje publicado y confirmado!',
          hash: txHash
        });

        // Resetear después de 3 segundos
        setTimeout(() => {
          setTxStatus({ status: 'idle' });
        }, 3000);
      });

    } catch (err: any) {
      console.error('Error sending message:', err);
      let errorMessage = 'Error al enviar el mensaje';
      
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'No tienes suficientes tokens SHIFT (costo: 1 SHIFT)';
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

  const remainingChars = 280 - message.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
        <MessageSquare className="w-6 h-6 mr-2 text-purple-400" />
        Enviar Mensaje
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="message" className="block text-sm font-medium text-white/70">
              Tu mensaje
            </label>
            <span className={`text-xs ${
              remainingChars <= 20 
                ? remainingChars <= 0 
                  ? 'text-red-400' 
                  : 'text-yellow-400'
                : 'text-white/50'
            }`}>
              {remainingChars} caracteres restantes
            </span>
          </div>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿Qué quieres compartir con la comunidad?"
            rows={4}
            className="w-full px-4 py-3 glass-dark rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border border-white/10 resize-none"
            disabled={txStatus.status !== 'idle'}
          />
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

        {txStatus.status === 'mining' && (
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={txStatus.status !== 'idle' || message.length === 0 || message.length > 280}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-purple-400 disabled:to-violet-400 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:scale-100 group"
        >
          {txStatus.status === 'idle' ? (
            <>
              <Send className="w-5 h-5 mr-2" />
              Publicar Mensaje
            </>
          ) : (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          )}
        </button>

        {/* Info Box */}
        <div className="glass-dark p-4 rounded-xl border border-white/10">
          <p className="text-xs text-white/50 leading-relaxed">
            💡 <span className="font-medium">Tip:</span> Cada mensaje cuesta 1 SHIFT. Los mensajes son públicos y permanentes en la blockchain.
          </p>
        </div>
      </form>
    </motion.div>
  );
}
