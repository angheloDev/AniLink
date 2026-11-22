import { LEAFLET_CSS, LEAFLET_JS } from './leaflet-embed';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  price: string;
}

export interface MapOptions {
  center: [number, number];
  /** Load OpenStreetMap tiles. Offline, the map shows a plain canvas with barangay labels instead. */
  online: boolean;
  dark: boolean;
  zoom?: number;
  /** Barangay names drawn on the offline canvas. */
  labels?: { name: string; lat: number; lng: number }[];
}

/** JSON that is safe inside an HTML <script> (no closing-tag or comment breakouts). */
function safeJson(v: unknown): string {
  return JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/**
 * A self-contained HTML page: the Leaflet runtime is embedded, so it renders with no CDN.
 * Tapping a pin posts {type:'select', id} to the React Native side.
 */
export function buildMapHtml(markers: MapMarker[], opts: MapOptions): string {
  const bg = opts.dark ? '#1A3F36' : '#DCEBDD';
  const fg = opts.dark ? '#ECE8E0' : '#1F1E1B';
  const tileFilter = opts.dark ? '.leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.88) contrast(.9);}' : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>${LEAFLET_CSS}
html,body,#map{height:100%;margin:0;padding:0;background:${bg};font-family:sans-serif}
${tileFilter}
.pin{background:${opts.dark ? '#E8834A' : '#1E5A45'};color:${opts.dark ? '#1F1E1B' : '#fff'};border-radius:14px;padding:3px 9px;font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:translate(-50%,-100%);position:absolute;border:2px solid #fff}
.pin.sel{background:#F0C04B;color:#1F1E1B}
.lbl{color:${fg};opacity:.55;font-size:10px;font-weight:600;white-space:nowrap;transform:translate(-50%,-50%);position:absolute}
.leaflet-control-attribution{font-size:9px!important}
</style></head><body><div id="map"></div>
<script>${LEAFLET_JS}</script>
<script>
(function(){
  var markers = ${safeJson(markers)};
  var labels = ${safeJson(opts.online ? [] : (opts.labels ?? []))};
  var map = L.map('map',{zoomControl:false,attributionControl:${opts.online ? 'true' : 'false'}}).setView([${opts.center[0]},${opts.center[1]}],${opts.zoom ?? 11});
  ${opts.online ? `L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap'}).addTo(map);` : ''}
  function post(o){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify(o)); } }
  labels.forEach(function(b){
    var el=document.createElement('div'); el.className='lbl'; el.textContent=b.name;
    L.marker([b.lat,b.lng],{icon:L.divIcon({className:'',html:el.outerHTML,iconSize:[0,0]}),interactive:false}).addTo(map);
  });
  var selected=null;
  markers.forEach(function(m){
    var el=document.createElement('div'); el.className='pin'; el.textContent=m.price;
    var mk=L.marker([m.lat,m.lng],{icon:L.divIcon({className:'',html:el.outerHTML,iconSize:[0,0]}),title:m.label}).addTo(map);
    mk.on('click',function(){
      if(selected){ var o=selected.getElement(); if(o){ var p=o.querySelector('.pin'); if(p) p.classList.remove('sel'); } }
      selected=mk; var e=mk.getElement(); if(e){ var q=e.querySelector('.pin'); if(q) q.classList.add('sel'); }
      post({type:'select',id:m.id});
    });
  });
  if(markers.length>1){ map.fitBounds(markers.map(function(m){return [m.lat,m.lng];}),{padding:[48,48],maxZoom:14}); }
  map.on('click',function(){ post({type:'blank'}); });
  ${opts.online ? `var errs=0; map.eachLayer(function(l){ if(l.on && l._url){ l.on('tileerror',function(){ errs++; if(errs===6){ post({type:'offline'}); } }); } });` : ''}
  post({type:'ready'});
})();
</script></body></html>`;
}
