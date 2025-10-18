'use client';

import { useState } from 'react';
import { transferTokens } from '@/lib/contract';
import { waitForTransaction } from '@/lib/ethers';
import { TransactionStatus } from '@/types';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface TransferFormProps {
  account: string;
  onTransferSuccess?: () => void;
}

export default function TransferForm({ account, onTransferSuccess }: TransferFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !amount) {
      setTxStatus({
        status: 'error',
        message: 'Por favor completa todos los campos'
      });
      setTimeout(() => setTxStatus({ status: 'idle' }), 3000);
      return;
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setTxStatus({
        status: 'error',
        message: 'Dirección de destinatario inválida'
      });
      setTimeout(() => setTxStatus({ status: 'idle' }), 3000);
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTxStatus({
        status: 'error',
        message: 'Cantidad inválida'
      });
      setTimeout(() => setTxStatus({ status: 'idle' }), 3000);
      return;
    }

    try {
      setTxStatus({ status: 'pending', message: 'Preparando transferencia...' });

      const tx = await transferTokens(recipient, amount);
      
      setTxStatus({
        status: 'pending',
        message: 'Transacción enviada. Esperando confirmación...',
        hash: tx.hash
      });

      await waitForTransaction(tx.hash);

      setTxStatus({
        status: 'success',
        message: '¡Transferencia completada exitosamente!',
        hash: tx.hash
      });

      // Reset form and refresh data
      setTimeout(() => {
        setRecipient('');
        setAmount('');
        if (onTransferSuccess) {
          onTransferSuccess();
        }
        setTxStatus({ status: 'idle' });
      }, 3000);

    } catch (err: any) {
      console.error('Error transferring tokens:', err);
      let errorMessage = 'Error en la transferencia';
      
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Fondos insuficientes para la transferencia';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-dark rounded-2xl p-6 border border-white/10"
    >
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
        <Send className="w-6 h-6 mr-2 text-purple-400" />
        Transferir Tokens
      </h2>

      <form onSubmit={handleTransfer} className="space-y-6">
        {/* Recipient Address */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-white/70 mb-2">
            Dirección del destinatario
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 glass-dark rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            disabled={txStatus.status !== 'idle'}
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white/70 mb-2">
            Cantidad (SHIFT)
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 glass-dark rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              disabled={txStatus.status !== 'idle'}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 text-sm font-medium">
              SHIFT
            </div>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={txStatus.status !== 'idle'}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-purple-400 disabled:to-violet-400 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:scale-100 group"
        >
          {txStatus.status === 'idle' ? (
            <>
              <Send className="w-5 h-5 mr-2" />
              Enviar Tokens
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
            💡 <span className="font-medium">Tip:</span> Asegúrate de tener suficientes tokens SHIFT y ETH para el gas antes de realizar la transferencia.
          </p>
        </div>
      </form>
    </motion.div>
  );
}
