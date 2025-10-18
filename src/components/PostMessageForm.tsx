'use client';

import { useState, useEffect } from 'react';
import { postMessage, approveTokens, checkAllowance, getPostCost } from '@/lib/wall';
import { waitForTransaction } from '@/lib/ethers';
import { TransactionStatus } from '@/types';

interface PostMessageFormProps {
  account: string;
  onPostSuccess?: () => void;
}

export default function PostMessageForm({ account, onPostSuccess }: PostMessageFormProps) {
  const [content, setContent] = useState('');
  const [postCost, setPostCost] = useState('1');
  const [needsApproval, setNeedsApproval] = useState(true);
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });
  const [isApproving, setIsApproving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const maxLength = 280;

  useEffect(() => {
    checkApprovalStatus();
    fetchPostCost();
  }, [account]);

  const fetchPostCost = async () => {
    try {
      const cost = await getPostCost();
      setPostCost(cost);
    } catch (error) {
      console.error('Error getting post cost:', error);
    }
  };

  const checkApprovalStatus = async () => {
    try {
      const allowance = await checkAllowance(account);
      const costInWei = BigInt(10 ** 18); // 1 token
      setNeedsApproval(allowance < costInWei);
    } catch (error) {
      console.error('Error checking approval:', error);
      setNeedsApproval(true);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setTxStatus({ status: 'pending', message: 'Aprobando tokens...' });

      // Approve a bit more than needed for multiple posts
      const tx = await approveTokens('10'); // Approve 10 SHIFT
      setTxStatus({
        status: 'pending',
        message: 'Transacción enviada, esperando confirmación...',
        hash: tx.hash
      });

      const receipt = await waitForTransaction(tx.hash);

      if (receipt?.status === 1) {
        setTxStatus({
          status: 'success',
          message: '¡Tokens aprobados! Ahora puedes publicar mensajes.',
          hash: tx.hash
        });
        setNeedsApproval(false);

        setTimeout(() => {
          setTxStatus({ status: 'idle' });
        }, 5000);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error approving tokens:', err);
      let errorMessage = 'Error aprobando tokens';

      if (err.message.includes('user rejected')) {
        errorMessage = 'Transacción rechazada por el usuario';
      }

      setTxStatus({ status: 'error', message: errorMessage });

      setTimeout(() => {
        setTxStatus({ status: 'idle' });
      }, 5000);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setTxStatus({ status: 'error', message: 'El mensaje no puede estar vacío' });
      return;
    }

    if (content.length > maxLength) {
      setTxStatus({ status: 'error', message: `El mensaje es demasiado largo (máx ${maxLength} caracteres)` });
      return;
    }

    try {
      setIsPosting(true);
      setTxStatus({ status: 'pending', message: 'Publicando mensaje...' });

      const tx = await postMessage(content);
      setTxStatus({
        status: 'pending',
        message: 'Mensaje enviado, esperando confirmación...',
        hash: tx.hash
      });

      const receipt = await waitForTransaction(tx.hash);

      if (receipt?.status === 1) {
        setTxStatus({
          status: 'success',
          message: '¡Mensaje publicado exitosamente!',
          hash: tx.hash
        });

        // Clear form
        setContent('');

        // Check if needs approval again
        setTimeout(() => {
          checkApprovalStatus();
          onPostSuccess?.();
        }, 2000);

        setTimeout(() => {
          setTxStatus({ status: 'idle' });
        }, 5000);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error posting message:', err);
      let errorMessage = 'Error publicando mensaje';

      if (err.message.includes('insufficient allowance') || err.message.includes('ERC20InsufficientAllowance')) {
        errorMessage = 'Tokens no aprobados. Aprueba primero los tokens.';
        setNeedsApproval(true);
      } else if (err.message.includes('insufficient funds') || err.message.includes('ERC20InsufficientBalance')) {
        errorMessage = 'Balance insuficiente de tokens SHIFT';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (err.message.includes('gas')) {
        errorMessage = 'Error de gas. Verifica que tengas suficiente ETH.';
      }

      setTxStatus({ status: 'error', message: errorMessage });

      setTimeout(() => {
        setTxStatus({ status: 'idle' });
      }, 5000);
    } finally {
      setIsPosting(false);
    }
  };

  const remainingChars = maxLength - content.length;

  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold mb-4 text-white">✍️ Publicar Mensaje</h2>

      {needsApproval && (
        <div className="mb-4 p-4 glass rounded-xl border border-yellow-500/30">
          <p className="text-yellow-300 text-sm mb-3">
            ⚠️ Primero debes aprobar que el contrato ShiftWall use tus tokens SHIFT.
          </p>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full bg-yellow-600/80 hover:bg-yellow-600 disabled:bg-yellow-600/40 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isApproving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Aprobando...
              </div>
            ) : (
              `Aprobar Tokens (10 SHIFT)`
            )}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
            Tu mensaje (costo: {postCost} SHIFT)
          </label>
          <textarea
            id="message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu mensaje... 💬"
            rows={4}
            maxLength={maxLength}
            className={`w-full px-3 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border ${
              remainingChars < 0 ? 'border-red-500/50' : 'border-white/10'
            } bg-white/5 text-white placeholder-white/40`}
            disabled={needsApproval || isPosting}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-white/50">
              Puedes usar emojis: 🚀 💎 🌙 ⚡️ 🔥
            </p>
            <p className={`text-xs ${remainingChars < 20 ? 'text-red-400' : 'text-white/50'}`}>
              {remainingChars} caracteres restantes
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={needsApproval || isPosting || !content.trim() || remainingChars < 0}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
            needsApproval || isPosting || !content.trim() || remainingChars < 0
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isPosting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Publicando...
            </div>
          ) : needsApproval ? (
            'Aprueba tokens primero'
          ) : (
            `Publicar por ${postCost} SHIFT`
          )}
        </button>
      </form>

      {txStatus.status !== 'idle' && (
        <div className={`mt-4 p-3 rounded-lg text-sm glass border ${
          txStatus.status === 'success' 
            ? 'border-green-500/30 text-green-300'
            : txStatus.status === 'error'
            ? 'border-red-500/30 text-red-300'
            : 'border-blue-500/30 text-blue-300'
        }`}>
          <p>{txStatus.message}</p>
          {txStatus.hash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txStatus.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline text-xs mt-1 block"
            >
              Ver en Etherscan →
            </a>
          )}
        </div>
      )}

      <div className="mt-4 p-3 glass rounded-lg border border-purple-500/30">
        <p className="text-xs text-purple-300">
          💡 <strong>Tip:</strong> Los mensajes son permanentes y públicos en la blockchain. ¡Piensa antes de publicar!
        </p>
      </div>
    </div>
  );
}
