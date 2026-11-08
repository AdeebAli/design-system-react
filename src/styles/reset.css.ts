import { globalStyle } from '@vanilla-extract/css';
import { resetLayer } from './layers.css';

function reset(selector: string, rule: Record<string, string | number>) {
  globalStyle(selector, { '@layer': { [resetLayer]: rule } });
}

reset('*, *::before, *::after', { boxSizing: 'border-box' });
reset('*', { margin: 0 });
reset('html', { WebkitFontSmoothing: 'antialiased' });
reset('img, svg, video, canvas', { display: 'block', maxWidth: '100%' });
reset('input, button, textarea, select', { font: 'inherit' });
reset('p', { textWrap: 'pretty' });
reset('h1, h2, h3, h4, h5, h6', { textWrap: 'balance' });
