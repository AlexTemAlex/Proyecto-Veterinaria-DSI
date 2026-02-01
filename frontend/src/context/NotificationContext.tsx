import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface AppNotification {
  id: string;
  tipo: "inventario" | "documentos" | "citas";
  accion: "agregar" | "editar" | "eliminar";
  mensaje: string;
  fecha: Date;
  leida: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    tipo: AppNotification["tipo"],
    accion: AppNotification["accion"],
    detalle: string
  ) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const ACCION_LABELS: Record<AppNotification["accion"], string> = {
  agregar: "Se agregó",
  editar: "Se editó",
  eliminar: "Se eliminó",
};

const TIPO_ICONS: Record<AppNotification["tipo"], string> = {
  inventario: "package",
  documentos: "file-text",
  citas: "calendar",
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export { TIPO_ICONS };

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback(
    (
      tipo: AppNotification["tipo"],
      accion: AppNotification["accion"],
      detalle: string
    ) => {
      const newNotif: AppNotification = {
        id: crypto.randomUUID(),
        tipo,
        accion,
        mensaje: `${ACCION_LABELS[accion]} ${detalle}`,
        fecha: new Date(),
        leida: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
