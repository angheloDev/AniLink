import { Alert } from '../models/Alert';
import type { ListingDoc } from '../models/Listing';
import { notify } from './notifications';

export function matchAlert(
  alert: { crop: string; maxPrice?: number | null; barangay?: string | null },
  listing: { title: string; price: number; barangay: string },
): boolean {
  if (!listing.title.toLowerCase().includes(alert.crop.trim().toLowerCase())) return false;
  if (alert.maxPrice != null && listing.price > alert.maxPrice) return false;
  if (alert.barangay && alert.barangay.toLowerCase() !== listing.barangay.toLowerCase()) return false;
  return true;
}

export async function matchAlerts(listing: ListingDoc): Promise<void> {
  const alerts = await Alert.find({ userId: { $ne: listing.sellerId } });
  const users = new Set<string>();
  for (const a of alerts) if (matchAlert(a, listing)) users.add(String(a.userId));
  await Promise.all(
    [...users].map((uid) =>
      notify(uid, {
        type: 'alert',
        title: 'Harvest alert',
        body: `${listing.title} · ₱${listing.price}/${listing.unit} in ${listing.barangay}`,
        route: `/listing/${String(listing._id)}`,
      }),
    ),
  );
}
