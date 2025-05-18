// src/components/tecnico/priority-edit-modal.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

interface PriorityEditModalProps {
  ticketId: number;
  currentPriority: string;
  onClose: () => void;
  onSave: (priority: string, comment: string) => Promise<void>;
}

export default function PriorityEditModal({
  ticketId,
  currentPriority,
  onClose,
  onSave
}: PriorityEditModalProps) {
  const [selectedPriority, setSelectedPriority] = useState(currentPriority);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar comentário
    if (!comment.trim()) {
      setError('É necessário informar o motivo da alteração de prioridade');
      return;
    }

    // Validar se a prioridade mudou
    if (selectedPriority === currentPriority) {
      setError('Selecione uma prioridade diferente da atual');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(selectedPriority, comment);
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
      setError('Ocorreu um erro ao atualizar a prioridade. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Alterar Prioridade do Chamado #{ticketId}</h2>
        
        {error && (
          <Alert 
            variant="destructive" 
            title="Erro" 
            onClose={() => setError('')}
            className="mb-4"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nova Prioridade
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="prioridade"
                  value="BAIXA"
                  checked={selectedPriority === 'BAIXA'}
                  onChange={() => setSelectedPriority('BAIXA')}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Baixa</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="prioridade"
                  value="MEDIA"
                  checked={selectedPriority === 'MEDIA'}
                  onChange={() => setSelectedPriority('MEDIA')}
                  className="mr-2"
                />
                <span className="text-yellow-600 font-medium">Média</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="prioridade"
                  value="ALTA"
                  checked={selectedPriority === 'ALTA'}
                  onChange={() => setSelectedPriority('ALTA')}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">Alta</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Justificativa da alteração <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2 min-h-[100px]"
              placeholder="Explique o motivo da alteração de prioridade..."
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              O cliente será notificado sobre esta alteração junto com sua justificativa.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alteração'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}