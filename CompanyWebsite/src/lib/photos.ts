/** Real produce photos (see src/content/photoCredits.ts for who took them). Files live in public/photos. */
export const PHOTO_IDS = ['mango', 'banana', 'pineapple', 'tomato', 'eggplant', 'corn', 'pechay', 'kangkong', 'kamote', 'cassava', 'basket', 'rattan'] as const;
export type PhotoId = (typeof PHOTO_IDS)[number];

export const photoSrc = (id: PhotoId) => `/photos/${id}.jpg`;
