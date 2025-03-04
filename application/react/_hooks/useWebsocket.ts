
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io();

export const useWebsocket = <T>(url: string, handler: (response: T) => void) => {
  useEffect(() => {
    socket.on(url, (response: T) => (handler(response)))

    return () => {
      socket.off(url);
    }
  }, [url, handler])
}