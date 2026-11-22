import { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { LAND_FILLERS, MAP_PINS, project, ROUTE, VIEWBOX } from '../../lib/mapData';
import { useReducedMotion } from '../../lib/reducedMotion';
import { pointOnPolyline } from '../../lib/route';

const LOOP_MS = 9000;
const STATIC_T = 0.6;

/** Stylised Zamboanga map with barangay pins and a rider moving along the delivery route. No tiles, no network. */
export function MapScreen() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(STATIC_T);

  useEffect(() => {
    if (reduced) {
      setProgress(STATIC_T);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      setProgress(((now - start) % LOOP_MS) / LOOP_MS);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [reduced]);

  const [rx, ry] = pointOnPolyline(ROUTE, reduced ? STATIC_T : progress);
  const pins = MAP_PINS.map((p) => ({ ...p, pos: project(p.lat, p.lng) }));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      <div className="flex items-baseline justify-between">
        <h3 className="m-0 font-display text-2xl text-headline">{t('map.title')}</h3>
        <span className="rounded-full bg-eyebrow/15 px-2 py-0.5 text-[10px] font-semibold text-eyebrow">{t('map.eta')}</span>
      </div>

      <svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} className="w-full rounded-2xl" role="img" aria-label={t('map.title')}>
        <rect width={VIEWBOX.w} height={VIEWBOX.h} fill="var(--deep-green)" />
        <g fill="var(--tint-leafy)">
          {pins.map((p) => (
            <circle key={p.id} cx={p.pos[0]} cy={p.pos[1]} r={46} />
          ))}
          {LAND_FILLERS.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
        <polyline
          points={ROUTE.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3}
          strokeDasharray="6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pins.map((p) => (
          <g key={p.id} data-testid="map-pin" transform={`translate(${p.pos[0]} ${p.pos[1]})`}>
            <title>{p.name}</title>
            <circle r={p.role ? 7 : 5} fill={p.role ? 'var(--accent)' : 'var(--eyebrow)'} stroke="var(--bg)" strokeWidth={2} />
            {p.price > 0 && (
              <>
                <rect x={-17} y={-26} width={34} height={14} rx={7} fill="var(--card)" />
                <text y={-16} textAnchor="middle" fontSize={8} fontWeight={600} fill="var(--text)">
                  ₱{p.price}
                </text>
              </>
            )}
            <text y={17} textAnchor="middle" fontSize={7.5} fill="var(--muted)">
              {p.name}
            </text>
          </g>
        ))}
        <circle data-testid="rider" cx={rx} cy={ry} r={7} fill="var(--sun)" stroke="#fff" strokeWidth={2.5} />
      </svg>

      <div className="flex items-center justify-between gap-2 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="size-2.5 rounded-full bg-accent" /> {t('map.farm')}
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="size-2.5 rounded-full bg-sun" /> {t('map.rider')}
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="size-2.5 rounded-full bg-accent" /> {t('map.you')}
        </span>
      </div>
      <p className="m-0 text-[10px] text-muted">{t('map.caption')}</p>
    </div>
  );
}
