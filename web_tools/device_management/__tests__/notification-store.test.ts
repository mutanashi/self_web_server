import { useNotificationStore } from "../lib/notification-store"
describe('NotificationStore', () => {
  beforeEach(() => {
    const store = useNotificationStore.getState();
    store.clearAllNotifications();
  });

  it('should add a new notification', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      title: 'New Alert',
      message: 'You have a new message',
      type: 'info',
    });

    const state = useNotificationStore.getState();
    expect(state.notifications.length).toBe(1);
    expect(state.unreadCount).toBe(1);
    expect(state.notifications[0].title).toBe('New Alert');
    expect(state.notifications[0].read).toBe(false);
  });

  it('should mark a notification as read', () => {
    const store = useNotificationStore.getState();
    store.addNotification({ title: 'Mark Me', message: 'To be read', type: 'info' });

    const state1 = useNotificationStore.getState();
    const id = state1.notifications[0].id;

    store.markAsRead(id);

    const state2 = useNotificationStore.getState();
    expect(state2.notifications[0].read).toBe(true);
    expect(state2.unreadCount).toBe(0);
  });

  it('should mark all notifications as read', () => {
    const store = useNotificationStore.getState();
    store.addNotification({ title: 'N1', message: '...', type: 'success' });
    store.addNotification({ title: 'N2', message: '...', type: 'warning' });

    store.markAllAsRead();

    const state = useNotificationStore.getState();
    expect(state.notifications.every(n => n.read)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('should remove a notification and update unreadCount', () => {
    const store = useNotificationStore.getState();
    store.addNotification({ title: 'Remove Me', message: 'Bye', type: 'error' });

    const id = useNotificationStore.getState().notifications[0].id;
    store.removeNotification(id);

    const state = useNotificationStore.getState();
    expect(state.notifications.length).toBe(0);
    expect(state.unreadCount).toBe(0);
  });

  it('should clear all notifications', () => {
    const store = useNotificationStore.getState();
    store.addNotification({ title: 'Clear Me', message: 'Gone', type: 'info' });

    store.clearAllNotifications();

    const state = useNotificationStore.getState();
    expect(state.notifications.length).toBe(0);
    expect(state.unreadCount).toBe(0);
  });
});
