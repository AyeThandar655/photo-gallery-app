import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { queryClient } from '@/lib/queryClient';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected !== false);
  });
});

type Props = {
  children: ReactNode;
};

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
