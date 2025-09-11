"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/components/providers/NotificationProvider";

export default function Providers({children}:{children:React.ReactNode}){
  const [client] = useState(()=> new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
