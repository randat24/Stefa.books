"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState , ReactNode } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import CacheInvalidationProvider from "@/components/providers/CacheInvalidationProvider";

export default function Providers({children}:{children:React.ReactNode}){
  const [client] = useState(()=> new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <NotificationProvider>
          <CacheInvalidationProvider>
            {children}
          </CacheInvalidationProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
