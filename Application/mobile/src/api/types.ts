export type Role = 'farmer' | 'buyer';
export type Category = 'vegetables' | 'fruits' | 'leafy' | 'rootcrops' | 'grains' | 'crafts' | 'others';
export type Unit = 'kg' | 'piece' | 'tali' | 'sack' | 'dozen';
export type DeliveryMethod = 'pickup' | 'delivery';

export const CATEGORIES: Category[] = ['vegetables', 'fruits', 'leafy', 'rootcrops', 'grains', 'crafts', 'others'];
export const UNITS: Unit[] = ['kg', 'piece', 'tali', 'sack', 'dozen'];

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  photoUrl: string | null;
  phone: string | null;
  barangay: string | null;
  farm: { name: string; description: string; crops: string[] } | null;
  verification: { status: 'none' | 'pending' | 'verified' };
  ratingAvg: number;
  ratingCount: number;
  language: 'en' | 'tl';
  onboarded: boolean;
  createdAt: string;
}

export interface PriceBadge {
  avg: number;
  diff: number;
  diffPct: number;
  label: 'below' | 'above' | 'fair';
}

export interface SellerSummary {
  id: string;
  name: string;
  photoUrl: string | null;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  barangay: string | null;
}

export interface ListingDTO {
  id: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  unit: Unit;
  stock: number;
  minOrder: number;
  harvestDate: string | null;
  preorder: boolean;
  negotiable: boolean;
  pickup: boolean;
  delivery: boolean;
  barangay: string;
  coords: { lat: number; lng: number };
  photos: string[];
  status: 'active' | 'paused' | 'soldout';
  views: number;
  favorited: boolean;
  favoritesCount: number;
  createdAt: string;
  seller: SellerSummary;
  priceGuide: PriceBadge | null;
  distanceKm?: number;
}

export interface ListingInput {
  title: string;
  description: string;
  category: Category;
  price: number;
  unit: Unit;
  stock: number;
  minOrder: number;
  harvestDate?: string;
  preorder: boolean;
  negotiable: boolean;
  pickup: boolean;
  delivery: boolean;
  barangay: string;
  photos: string[];
}

export interface ListingFilters {
  q?: string;
  category?: Category | '';
  minPrice?: number;
  maxPrice?: number;
  barangay?: string;
  verifiedOnly?: boolean;
  preorder?: boolean;
  delivery?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'nearest' | 'rating';
  lat?: number;
  lng?: number;
  sellerId?: string;
  mine?: boolean;
}

export interface ConversationDTO {
  id: string;
  listing: { id: string; title: string; photo: string | null; price: number; unit: Unit; category: Category } | null;
  other: { id: string; name: string; photoUrl: string | null; verified: boolean };
  role: 'buyer' | 'seller';
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'superseded';

export interface OfferDTO {
  id: string;
  conversationId: string;
  listingId: string;
  fromUserId: string;
  toUserId: string;
  pricePerUnit: number;
  quantity: number;
  delivery: DeliveryMethod;
  date: string;
  status: OfferStatus;
  orderId: string | null;
  createdAt: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'image' | 'offer' | 'system';
  text: string | null;
  imageUrl: string | null;
  offer: OfferDTO | null;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
  /** client-only: optimistic send state */
  pending?: boolean;
  failed?: boolean;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
export type PaymentMethod = 'ewallet_a' | 'ewallet_b' | 'bank' | 'cash';

export interface OrderDTO {
  id: string;
  listingId: string;
  title: string;
  unit: Unit;
  photo: string | null;
  quantity: number;
  pricePerUnit: number;
  total: number;
  delivery: DeliveryMethod;
  date: string;
  paymentMethod: PaymentMethod | null;
  paymentRef: string | null;
  status: OrderStatus;
  nextStatuses: OrderStatus[];
  history: { status: OrderStatus; at: string }[];
  reviewed: boolean;
  buyer: { id: string; name: string; photoUrl: string | null; verified: boolean };
  seller: { id: string; name: string; photoUrl: string | null; verified: boolean };
  createdAt: string;
}

export interface NotificationDTO {
  id: string;
  type: 'message' | 'offer' | 'order' | 'verification' | 'alert' | 'price';
  title: string;
  body: string;
  route: string;
  read: boolean;
  createdAt: string;
}

export interface PriceGuideDTO {
  id: string;
  crop: string;
  category: Category;
  unit: Unit;
  low: number;
  avg: number;
  high: number;
  trend: number[];
}

export interface AlertDTO {
  id: string;
  crop: string;
  maxPrice: number | null;
  barangay: string | null;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  buyer: { id: string; name: string; photoUrl: string | null };
}

export interface PublicProfile {
  user: {
    id: string;
    name: string;
    photoUrl: string | null;
    barangay: string | null;
    farm: { name: string; description: string; crops: string[] } | null;
    verified: boolean;
    ratingAvg: number;
    ratingCount: number;
    listingsCount: number;
    completedOrders: number;
    createdAt: string;
  };
  reviews: ReviewDTO[];
}

export interface Session {
  token: string;
  user: UserDTO;
}

export interface DashboardDTO {
  activeListings: number;
  views: number;
  pendingOffers: number;
  openOrders: number;
  earningsThisMonth: number;
  recentOffers: {
    id: string;
    conversationId: string;
    listingId: string;
    listingTitle: string;
    unit: Unit;
    buyerId: string;
    buyerName: string;
    buyerPhotoUrl: string | null;
    pricePerUnit: number;
    quantity: number;
    createdAt: string;
  }[];
}
