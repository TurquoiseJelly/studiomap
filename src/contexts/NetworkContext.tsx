import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown'
type EffectiveType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'

interface NetworkState {
  isOnline: boolean
  connectionType: ConnectionType
  effectiveType: EffectiveType
  downlink: number | null
  rtt: number | null
  saveData: boolean
  lastOnlineAt: Date | null
  offlineSince: Date | null
}

interface NetworkContextValue extends NetworkState {
  timeSinceOffline: number | null
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

interface NetworkProviderProps {
  children: ReactNode
}

function getConnectionInfo(): Pick<NetworkState, 'connectionType' | 'effectiveType' | 'downlink' | 'rtt' | 'saveData'> {
  const connection = (navigator as Navigator & {
    connection?: {
      type?: string
      effectiveType?: string
      downlink?: number
      rtt?: number
      saveData?: boolean
    }
  }).connection

  if (!connection) {
    return {
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: null,
      rtt: null,
      saveData: false,
    }
  }

  return {
    connectionType: (connection.type as ConnectionType) ?? 'unknown',
    effectiveType: (connection.effectiveType as EffectiveType) ?? 'unknown',
    downlink: connection.downlink ?? null,
    rtt: connection.rtt ?? null,
    saveData: connection.saveData ?? false,
  }
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [state, setState] = useState<NetworkState>(() => ({
    isOnline: navigator.onLine,
    ...getConnectionInfo(),
    lastOnlineAt: navigator.onLine ? new Date() : null,
    offlineSince: navigator.onLine ? null : new Date(),
  }))

  const [timeSinceOffline, setTimeSinceOffline] = useState<number | null>(null)

  const handleOnline = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOnline: true,
      lastOnlineAt: new Date(),
      offlineSince: null,
      ...getConnectionInfo(),
    }))
  }, [])

  const handleOffline = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOnline: false,
      offlineSince: new Date(),
    }))
  }, [])

  const handleConnectionChange = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ...getConnectionInfo(),
    }))
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection = (navigator as Navigator & {
      connection?: EventTarget
    }).connection

    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [handleOnline, handleOffline, handleConnectionChange])

  // Update time since offline every second when offline
  useEffect(() => {
    if (state.isOnline) {
      setTimeSinceOffline(null)
      return
    }

    const interval = setInterval(() => {
      if (state.offlineSince) {
        setTimeSinceOffline(Date.now() - state.offlineSince.getTime())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [state.isOnline, state.offlineSince])

  const value: NetworkContextValue = {
    ...state,
    timeSinceOffline,
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}
