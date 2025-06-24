import { useState, useCallback } from 'react';
import type { Notification } from '../components/NotificationPopup';

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: options?.duration ?? (type === 'error' ? 6000 : 4000),
      action: options?.action,
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string, options?: { duration?: number }) => {
    return addNotification('success', title, message, options);
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, options?: { duration?: number }) => {
    return addNotification('error', title, message, options);
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: { duration?: number }) => {
    return addNotification('warning', title, message, options);
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: { duration?: number }) => {
    return addNotification('info', title, message, options);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};