import type { ListingDoc } from '../models/Listing';
import { User } from '../models/User';
import { loadGuides, matchGuide, priceGuideBadge } from './priceGuide';

export async function toListingDTOs(docs: ListingDoc[], viewerId?: string) {
  const sellers = await User.find({ _id: { $in: docs.map((d) => d.sellerId) } });
  const bySeller = new Map(sellers.map((s) => [String(s._id), s]));
  const guides = await loadGuides();
  return docs.map((d) => {
    const s = bySeller.get(String(d.sellerId));
    const guide = matchGuide(d.title, guides);
    return {
      id: String(d._id),
      title: d.title,
      description: d.description,
      category: d.category,
      price: d.price,
      unit: d.unit,
      stock: d.stock,
      minOrder: d.minOrder,
      harvestDate: d.harvestDate ?? null,
      preorder: d.preorder,
      negotiable: d.negotiable,
      pickup: d.pickup,
      delivery: d.delivery,
      barangay: d.barangay,
      coords: { lat: d.coords.lat, lng: d.coords.lng },
      photos: d.photos,
      status: d.status,
      views: d.views,
      favorited: viewerId ? d.favoritedBy.some((f) => String(f) === viewerId) : false,
      favoritesCount: d.favoritedBy.length,
      createdAt: d.createdAt,
      seller: {
        id: String(d.sellerId),
        name: s?.name ?? 'Unknown',
        photoUrl: s?.photoUrl ?? null,
        verified: s?.verification?.status === 'verified',
        ratingAvg: s?.ratingAvg ?? 0,
        ratingCount: s?.ratingCount ?? 0,
        barangay: s?.barangay ?? null,
      },
      priceGuide: guide ? priceGuideBadge(d.price, guide.avg) : null,
    };
  });
}

export async function toListingDTO(doc: ListingDoc, viewerId?: string) {
  return (await toListingDTOs([doc], viewerId))[0];
}
