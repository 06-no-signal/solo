"use client";

// Source - https://stackoverflow.com/a
// Posted by Alen Vlahovljak, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-11, License - CC BY-SA 4.0

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  JSX,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

type WSProviderProps = {
  children: ReactNode;
  url?: string;
  postInit?: (ws: Socket) => void;
};

const WSStateContext = createContext<Socket | null>(null);

function WSProvider({ children, url, postInit }: WSProviderProps): JSX.Element {
  const [ws, setWs] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (url) {
      const socket = io(url);
      postInit?.(socket);
      setWs(socket);

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", (reason) => setConnected(false));
      socket.on("reconnect", () => setConnected(true));

      return () => {
        socket.close();
      };
    }
  }, [url]);

  return (
    <WSStateContext.Provider value={ws}>
      <div className="absolute bottom-0 right-0 p-4">
        {connected && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
        {!connected && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
      </div>
      {ws ? children : <div></div>}
    </WSStateContext.Provider>
  );
}

function useWS(): Socket {
  const context = useContext(WSStateContext);
  if (context === null) {
    throw new Error("useWS must be used within a WSProvider");
  }
  return context;
}

export { WSProvider, useWS };
