import { api } from './client';
import { buildQuery } from './query';
import type {
  AlertDTO,
  ConversationDTO,
  DashboardDTO,
  DeliveryMethod,
  ListingDTO,
  ListingFilters,
  ListingInput,
  MessageDTO,
  NotificationDTO,
  OfferDTO,
  OrderDTO,
  OrderStatus,
  PaymentMethod,
  PriceGuideDTO,
  PublicProfile,
  Role,
  Session,
  UserDTO,
} from './types';

export interface OfferTermsInput {
  pricePerUnit: number;
  quantity: number;
  delivery: DeliveryMethod;
  date: string;
}

// auth
export const register = (b: { name: string; email: string; password: string; role: Role }) => api<Session>('POST', '/api/auth/register', b);
export const login = (b: { email: string; password: string }) => api<Session>('POST', '/api/auth/login', b);
export const googleDemo = (b: { email: string; name: string; photoUrl?: string }) => api<Session>('POST', '/api/auth/google-demo', b);
export const otpRequest = (phone: string) => api<{ code: string }>('POST', '/api/auth/otp/request', { phone });
export const otpVerify = (phone: string, code: string) => api<{ ok: true }>('POST', '/api/auth/otp/verify', { phone, code });
export const forgotPassword = (email: string) => api<{ code: string }>('POST', '/api/auth/forgot', { email });
export const resetPassword = (b: { email: string; code: string; password: string }) => api<{ ok: true }>('POST', '/api/auth/reset', b);

// me
export const patchMe = (b: Partial<{ name: string; photoUrl: string; phone: string; barangay: string; role: Role; farm: { name?: string; description?: string; crops: string[] }; language: 'en' | 'tl'; onboarded: boolean }>) =>
  api<{ user: UserDTO }>('PATCH', '/api/me', b);
export const submitVerification = (b: { idPhotoUrl: string; farmPhotoUrl: string }) => api<{ user: UserDTO }>('POST', '/api/me/verification', b);

// listings
export const getListings = (f: ListingFilters = {}) => api<{ items: ListingDTO[] }>('GET', `/api/listings${buildQuery({ ...f })}`);
export const getListing = (id: string) => api<{ listing: ListingDTO }>('GET', `/api/listings/${id}`);
export const createListing = (b: ListingInput) => api<{ listing: ListingDTO }>('POST', '/api/listings', b);
export const updateListing = (id: string, b: Partial<ListingInput> & { status?: ListingDTO['status'] }) => api<{ listing: ListingDTO }>('PATCH', `/api/listings/${id}`, b);
export const deleteListing = (id: string) => api<{ ok: true }>('DELETE', `/api/listings/${id}`);
export const toggleFavorite = (id: string) => api<{ favorited: boolean }>('POST', `/api/listings/${id}/favorite`);
export const getDashboard = () => api<DashboardDTO>('GET', '/api/me/dashboard');
export const getFavorites = () => api<{ items: ListingDTO[] }>('GET', '/api/me/favorites');

// chat
export const openConversation = (listingId: string) => api<{ conversation: ConversationDTO }>('POST', '/api/conversations', { listingId });
export const getConversations = () => api<{ items: ConversationDTO[] }>('GET', '/api/conversations');
export const getMessages = (id: string, before?: string) => api<{ items: MessageDTO[] }>('GET', `/api/conversations/${id}/messages${buildQuery({ before })}`);
export const sendMessage = (id: string, b: { type: 'text' | 'image'; text?: string; imageUrl?: string }) => api<{ message: MessageDTO }>('POST', `/api/conversations/${id}/messages`, b);
export const markConversationRead = (id: string) => api<{ ok: true }>('POST', `/api/conversations/${id}/read`);
export const sendOffer = (id: string, b: OfferTermsInput) => api<{ message: MessageDTO; offer: OfferDTO }>('POST', `/api/conversations/${id}/offers`, b);
export const respondOffer = (id: string, action: 'accept' | 'decline' | 'counter', counter?: OfferTermsInput) =>
  api<{ offer: OfferDTO; newOffer?: OfferDTO }>('POST', `/api/offers/${id}/respond`, { action, counter });

// orders
export const getOrders = (role: 'buying' | 'selling') => api<{ items: OrderDTO[] }>('GET', `/api/orders?role=${role}`);
export const getOrder = (id: string) => api<{ order: OrderDTO }>('GET', `/api/orders/${id}`);
export const payOrder = (id: string, method: PaymentMethod) => api<{ order: OrderDTO }>('POST', `/api/orders/${id}/pay`, { method });
export const advanceOrder = (id: string, to: OrderStatus) => api<{ order: OrderDTO }>('POST', `/api/orders/${id}/advance`, { to });
export const cancelOrder = (id: string) => api<{ order: OrderDTO }>('POST', `/api/orders/${id}/cancel`);
export const reviewOrder = (id: string, rating: number, text: string) => api<{ review: { id: string } }>('POST', `/api/orders/${id}/reviews`, { rating, text });

// notifications
export const getNotifications = () => api<{ items: NotificationDTO[] }>('GET', '/api/notifications');
export const getUnreadCount = () => api<{ count: number }>('GET', '/api/notifications/unread-count');
export const markNotificationsRead = (ids?: string[]) => api<{ ok: true }>('POST', '/api/notifications/read', ids ? { ids } : {});

// price guide + alerts
export const getPriceGuide = () => api<{ items: PriceGuideDTO[] }>('GET', '/api/price-guide');
export const getAlerts = () => api<{ items: AlertDTO[] }>('GET', '/api/alerts');
export const createAlert = (b: { crop: string; maxPrice?: number; barangay?: string }) => api<{ alert: AlertDTO }>('POST', '/api/alerts', b);
export const deleteAlert = (id: string) => api<{ ok: true }>('DELETE', `/api/alerts/${id}`);

// users
export const getProfile = (id: string) => api<PublicProfile>('GET', `/api/users/${id}`);
export const blockUser = (id: string) => api<{ blocked: boolean }>('POST', `/api/users/${id}/block`);
export const unblockUser = (id: string) => api<{ blocked: boolean }>('DELETE', `/api/users/${id}/block`);
export const report = (b: { targetType: 'user' | 'listing'; targetId: string; reason: string }) => api<{ ok: true }>('POST', '/api/reports', b);
