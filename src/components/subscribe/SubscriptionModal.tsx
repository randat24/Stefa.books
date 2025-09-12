'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubscribeFormHome from './SubscribeFormHome';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'mini' | 'maxi';
}

export function SubscriptionModal({ isOpen, onClose, defaultPlan }: SubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="subscription-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-h2 text-neutral-900">
              Оформити підписку
            </h2>
            <p className="text-neutral-600 mt-1">
              Оберіть план та заповніть форму для підписки
            </p>
          </div>
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="p-2 hover:bg-neutral-100"
            data-testid="modal-close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <SubscribeFormHome defaultPlan={defaultPlan} />
        </div>
      </div>
    </div>
  );
}
