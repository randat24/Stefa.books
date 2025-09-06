'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Modal } from '@/components/ui/modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register' | 'forgot';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>(initialView);

  const handleClose = () => {
    setView('login'); // Reset to login view when closing
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Вхід в систему">
      <div className="w-full max-w-md mx-auto">
        {view === 'login' && (
          <LoginForm 
            onSwitchToRegister={() => setView('register')}
            onForgotPassword={() => setView('forgot')}
            onSuccess={handleSuccess}
          />
        )}
        
        {view === 'register' && (
          <RegisterForm 
            onSwitchToLogin={() => setView('login')}
            onSuccess={handleSuccess}
          />
        )}
        
        {view === 'forgot' && (
          <ForgotPasswordForm 
            onBackToLogin={() => setView('login')}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </Modal>
  );
}
