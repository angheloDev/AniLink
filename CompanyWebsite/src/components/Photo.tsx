import { photoSrc, type PhotoId } from '../lib/photos';

interface Props {
  id: PhotoId;
  /** Describe the product. Leave empty when the photo only decorates text that already names it. */
  alt?: string;
  className?: string;
  /** Photos in the first screen load right away; everything else waits until it is near the viewport. */
  eager?: boolean;
}

/** A real produce photo, cropped to fill whatever box the caller gives it. */
export function Photo({ id, alt = '', className = '', eager = false }: Props) {
  return (
    <img
      src={photoSrc(id)}
      alt={alt}
      width={600}
      height={400}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
