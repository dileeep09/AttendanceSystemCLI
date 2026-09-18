import { useNetInfo } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const netInfo = useNetInfo();
  return {
    isOffline: netInfo.isConnected === false,
    isReachable: netInfo.isInternetReachable !== false,
  };
}
