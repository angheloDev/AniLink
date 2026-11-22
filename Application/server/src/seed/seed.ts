import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Conversation, Message } from '../models/Chat';
import { Listing } from '../models/Listing';
import { Notification } from '../models/Notification';
import { Order } from '../models/Order';
import { PriceGuide } from '../models/PriceGuide';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { barangayCoords } from '../services/geo';
import { BUYERS, FARMERS, GUIDES, LISTINGS } from './data';

const DAY = 24 * 60 * 60 * 1000;

function trend(avg: number): number[] {
  // Deterministic 8-week wobble that ends at the current average.
  const wobble = [-0.08, -0.05, -0.06, -0.02, 0.03, 0.01, -0.01, 0];
  return wobble.map((w) => Math.round(avg * (1 + w) * 100) / 100);
}

export async function seed(): Promise<{ users: number; listings: number }> {
  await mongoose.connection.dropDatabase();
  const passwordHash = await bcrypt.hash('anilink123', 8);
  const now = Date.now();

  const farmerDocs = new Map<string, InstanceType<typeof User>>();
  for (const f of FARMERS) {
    const u = await User.create({
      name: f.name,
      email: f.email,
      passwordHash,
      role: 'farmer',
      barangay: f.barangay,
      farm: f.farm,
      verification: { status: f.verified ? 'verified' : 'none' },
      onboarded: true,
    });
    farmerDocs.set(f.key, u);
  }
  const buyerDocs: InstanceType<typeof User>[] = [];
  for (const b of BUYERS) {
    buyerDocs.push(await User.create({ name: b.name, email: b.email, passwordHash, role: 'buyer', barangay: b.barangay, onboarded: true }));
  }

  for (const g of GUIDES) {
    await PriceGuide.create({ crop: g.crop, category: g.category, unit: g.unit, low: Math.round(g.avg * 0.8), avg: g.avg, high: Math.round(g.avg * 1.25), trend: trend(g.avg) });
  }

  const listingDocs: InstanceType<typeof Listing>[] = [];
  for (let i = 0; i < LISTINGS.length; i++) {
    const l = LISTINGS[i];
    const farmer = farmerDocs.get(l.f)!;
    const coords = barangayCoords(farmer.barangay!)!;
    listingDocs.push(
      await Listing.create({
        sellerId: farmer._id,
        title: l.t,
        description: l.d,
        category: l.c,
        price: l.p,
        unit: l.u,
        stock: l.s,
        minOrder: l.min ?? 1,
        harvestDate: new Date(now + (l.pre ? l.pre : -((i % 3) + 1)) * DAY),
        preorder: !!l.pre,
        negotiable: l.neg ?? true,
        pickup: true,
        delivery: !!l.del,
        barangay: farmer.barangay,
        coords,
        photos: [],
        views: 10 + ((i * 17) % 90),
        createdAt: new Date(now - (i % 9) * DAY - i * 3600_000),
      }),
    );
  }
  const byTitle = (t: string) => listingDocs.find((l) => l.title === t)!;

  // Completed, reviewed orders so sellers have ratings.
  const reviewPlan: [string, number, number][] = [
    ['Baguio Tomatoes', 0, 5], ['Baguio Tomatoes', 1, 5], ['Native Eggplant (Talong)', 2, 4], ['Fresh Okra', 1, 5],
    ['Fresh Pechay', 0, 5], ['Kangkong', 2, 4], ['Romaine Lettuce', 1, 5],
    ['Lakatan Bananas', 1, 5], ['Pineapple', 2, 5], ['Papaya', 0, 4], ['Carabao Mangoes', 2, 5],
    ['Mangosteen', 1, 4], ['Rambutan', 2, 5],
    ['Handwoven Banig Mat', 0, 5], ['Camote (Sweet Potato)', 2, 4],
  ];
  for (const [title, buyerIdx, rating] of reviewPlan) {
    const l = byTitle(title);
    const buyer = buyerDocs[buyerIdx];
    const qty = 2 + (rating % 3);
    const order = await Order.create({
      listingId: l._id, buyerId: buyer._id, sellerId: l.sellerId, title: l.title, unit: l.unit, quantity: qty, pricePerUnit: l.price,
      total: qty * l.price, delivery: 'pickup', date: new Date(now - 6 * DAY).toISOString().slice(0, 10), paymentMethod: 'ewallet_a', paymentRef: `AL-${String(l._id).slice(-8).toUpperCase()}`,
      status: 'completed',
      history: [{ status: 'pending_payment', at: new Date(now - 9 * DAY) }, { status: 'paid', at: new Date(now - 9 * DAY) }, { status: 'completed', at: new Date(now - 7 * DAY) }],
    });
    await Review.create({ orderId: order._id, listingId: l._id, sellerId: l.sellerId, buyerId: buyer._id, rating, text: rating === 5 ? 'Sariwa at mabilis ang transaksyon. Salamat po!' : 'Maayos ang produkto, babalik ulit.' });
  }
  for (const f of farmerDocs.values()) {
    const [agg] = await Review.aggregate([{ $match: { sellerId: f._id } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
    if (agg) await User.updateOne({ _id: f._id }, { ratingAvg: Math.round(agg.avg * 100) / 100, ratingCount: agg.n });
  }

  // Demo buyer: one completed (unreviewed) order and one in preparation.
  const demoBuyer = buyerDocs[0];
  const mango = byTitle('Carabao Mangoes');
  const tomato = byTitle('Baguio Tomatoes');
  const day = (n: number) => new Date(now + n * DAY).toISOString().slice(0, 10);
  await Order.create({
    listingId: mango._id, buyerId: demoBuyer._id, sellerId: mango.sellerId, title: mango.title, unit: mango.unit, quantity: 10, pricePerUnit: 125, total: 1250,
    delivery: 'pickup', date: day(-2), paymentMethod: 'ewallet_b', paymentRef: 'AL-7C21D9AA', status: 'completed',
    history: [{ status: 'pending_payment', at: new Date(now - 5 * DAY) }, { status: 'paid', at: new Date(now - 5 * DAY) }, { status: 'preparing', at: new Date(now - 4 * DAY) }, { status: 'ready_for_pickup', at: new Date(now - 3 * DAY) }, { status: 'completed', at: new Date(now - 2 * DAY) }],
  });
  await Order.create({
    listingId: tomato._id, buyerId: demoBuyer._id, sellerId: tomato.sellerId, title: tomato.title, unit: tomato.unit, quantity: 5, pricePerUnit: 80, total: 400,
    delivery: 'delivery', date: day(1), paymentMethod: 'ewallet_a', paymentRef: 'AL-31B0E4F2', status: 'preparing',
    history: [{ status: 'pending_payment', at: new Date(now - DAY) }, { status: 'paid', at: new Date(now - DAY) }, { status: 'preparing', at: new Date(now - 3600_000) }],
  });

  // Demo conversation (buyer demo <-> farmer demo about tomatoes) with an unread message for the farmer.
  const conv = await Conversation.create({ listingId: tomato._id, buyerId: demoBuyer._id, sellerId: tomato.sellerId, lastMessage: 'Last price po sa 20kg?', lastAt: new Date(now - 600_000), unread: { buyer: 0, seller: 1 } });
  const lines: [typeof demoBuyer, string][] = [
    [demoBuyer, 'Magandang araw po! Available pa po ba ang tomatoes?'],
    [farmerDocs.get('ruben')!, 'Opo, available pa po. Bagong ani kaninang umaga.'],
    [demoBuyer, 'Last price po sa 20kg?'],
  ];
  for (let i = 0; i < lines.length; i++) {
    await Message.create({ conversationId: conv._id, senderId: lines[i][0]._id, type: 'text', text: lines[i][1], readAt: i < 2 ? new Date(now) : undefined, createdAt: new Date(now - (lines.length - i) * 600_000) });
  }

  await Notification.create({ userId: demoBuyer._id, type: 'order', title: 'Order preparing', body: tomato.title, route: '/orders' });
  await Notification.create({ userId: farmerDocs.get('ruben')!._id, type: 'message', title: demoBuyer.name, body: 'Last price po sa 20kg?', route: `/chat/${String(conv._id)}` });

  return { users: FARMERS.length + BUYERS.length, listings: listingDocs.length };
}
