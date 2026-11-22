import { Notification, type INotification } from '../models/Notification';
import { emitToUser } from './realtime';

export interface NotifyInput {
  type: INotification['type'];
  title: string;
  body: string;
  route: string;
}

export function toNotificationDTO(n: InstanceType<typeof Notification>) {
  return {
    id: String(n._id),
    type: n.type,
    title: n.title,
    body: n.body,
    route: n.route,
    read: !!n.readAt,
    createdAt: n.createdAt,
  };
}

export async function notify(userId: string, input: NotifyInput): Promise<void> {
  const n = await Notification.create({ userId, ...input });
  emitToUser(userId, 'notification:new', { notification: toNotificationDTO(n) });
}
