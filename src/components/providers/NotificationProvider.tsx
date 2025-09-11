"use client";

import { Toaster } from "sonner";
import { ReactNode } from "react";

interface NotificationProviderProps {
  children?: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={4000}
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </>
  );
}
