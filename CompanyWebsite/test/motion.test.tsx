import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountUp } from '../src/components/CountUp';
import { Faq } from '../src/components/Faq';
import { LanguageToggle } from '../src/components/LanguageToggle';
import { Nav } from '../src/components/Nav';
import { Reveal } from '../src/components/Reveal';
import { ScrollProgress } from '../src/components/ScrollProgress';
import { scrollFraction } from '../src/lib/scroll';
import { renderWithProviders } from './utils';

type Entry = { isIntersecting: boolean; target: Element };
/** A controllable IntersectionObserver: call show() to say "everything observed is now on screen". */
function stubIntersectionObserver() {
  const live: Array<{ cb: (e: Entry[]) => void; els: Set<Element> }> = [];
  class FakeIO {
    cb: (e: Entry[]) => void;
    els = new Set<Element>();
    constructor(cb: (e: Entry[]) => void) {
      this.cb = cb;
      live.push(this);
    }
    observe(el: Element) {
      this.els.add(el);
    }
    unobserve(el: Element) {
      this.els.delete(el);
    }
    disconnect() {
      this.els.clear();
    }
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', FakeIO);
  return { show: () => act(() => live.forEach((io) => io.cb([...io.els].map((target) => ({ isIntersecting: true, target }))))) };
}

function stubReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce, addEventListener: () => {}, removeEventListener: () => {} }) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  // @ts-expect-error remove the test double
  delete window.matchMedia;
});

describe('Reveal (fade up when scrolled into view)', () => {
  it('shows its content straight away when the browser has no IntersectionObserver', () => {
    render(<Reveal data-testid="r">hello</Reveal>);
    expect(screen.getByTestId('r')).toHaveTextContent('hello');
    expect(screen.getByTestId('r')).not.toHaveAttribute('data-reveal');
  });

  it('starts hidden, then plays once it scrolls into view', () => {
    const io = stubIntersectionObserver();
    render(<Reveal data-testid="r">hello</Reveal>);
    expect(screen.getByTestId('r')).toHaveAttribute('data-reveal', 'hidden');
    io.show();
    expect(screen.getByTestId('r')).toHaveAttribute('data-reveal', 'shown');
  });

  it('never hides anything for visitors who asked for less motion', () => {
    stubIntersectionObserver();
    stubReducedMotion(true);
    render(<Reveal data-testid="r">hello</Reveal>);
    expect(screen.getByTestId('r')).not.toHaveAttribute('data-reveal', 'hidden');
  });

  it('passes the stagger delay to CSS and renders the element you ask for', () => {
    stubIntersectionObserver();
    render(
      <ul>
        <Reveal as="li" delay={240} data-testid="r" className="x">
          item
        </Reveal>
      </ul>,
    );
    const li = screen.getByTestId('r');
    expect(li.tagName).toBe('LI');
    expect(li).toHaveClass('x');
    expect(li.style.getPropertyValue('--reveal-delay')).toBe('240ms');
  });
});

describe('CountUp (numbers that count up when they appear)', () => {
  it('shows the final number at once when there is nothing to wait for', () => {
    render(<CountUp value={98} />);
    expect(screen.getByText('98')).toBeInTheDocument();
  });

  it('counts from 0 to the value once it is on screen', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] });
    const io = stubIntersectionObserver();
    render(<CountUp value={98} data-testid="n" />);
    expect(screen.getByTestId('n')).toHaveTextContent('0');
    io.show();
    act(() => void vi.advanceTimersByTime(500));
    const mid = Number(screen.getByTestId('n').textContent);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(98);
    act(() => void vi.advanceTimersByTime(2500));
    expect(screen.getByTestId('n')).toHaveTextContent('98');
  });

  it('skips the counting for visitors who asked for less motion', () => {
    stubIntersectionObserver();
    stubReducedMotion(true);
    render(<CountUp value={98} data-testid="n" />);
    expect(screen.getByTestId('n')).toHaveTextContent('98');
  });
});

describe('scroll progress and the shrinking header', () => {
  const setScroll = (y: number) => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    fireEvent.scroll(window);
  };
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1300, configurable: true });
  });
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('scrollFraction is 0 at the top, 1 at the bottom, and never leaves 0 to 1', () => {
    expect(scrollFraction(0, 1300, 800)).toBe(0);
    expect(scrollFraction(250, 1300, 800)).toBe(0.5);
    expect(scrollFraction(500, 1300, 800)).toBe(1);
    expect(scrollFraction(900, 1300, 800)).toBe(1);
    expect(scrollFraction(-40, 1300, 800)).toBe(0);
    expect(scrollFraction(10, 700, 800)).toBe(0);
  });

  it('the progress bar fills as the page scrolls', () => {
    render(<ScrollProgress />);
    const bar = screen.getByTestId('scroll-progress');
    expect(bar.style.transform).toBe('scaleX(0)');
    setScroll(300);
    expect(bar.style.transform).toBe('scaleX(0.6)');
  });

  it('the header knows when the page has scrolled', () => {
    renderWithProviders(<Nav />);
    const header = document.querySelector('header') as HTMLElement;
    expect(header).toHaveAttribute('data-scrolled', 'false');
    setScroll(120);
    expect(header).toHaveAttribute('data-scrolled', 'true');
    setScroll(0);
    expect(header).toHaveAttribute('data-scrolled', 'false');
  });
});

describe('language toggle pill', () => {
  beforeEach(() => localStorage.clear());

  it('slides to the language that is selected', async () => {
    renderWithProviders(<LanguageToggle />);
    const pill = screen.getByTestId('lang-pill');
    expect(pill.style.transform).toBe('translateX(0%)');
    await userEvent.setup().click(screen.getByRole('button', { name: 'TL' }));
    expect(pill.style.transform).toBe('translateX(100%)');
  });
});

describe('FAQ accordion animates open and shut', () => {
  it('each answer panel reports its state so CSS can animate the height', () => {
    renderWithProviders(<Faq />);
    const first = screen.getAllByRole('button', { name: /./ })[0];
    const panel = document.getElementById(first.getAttribute('aria-controls') ?? '') as HTMLElement;
    expect(panel).toHaveAttribute('data-open', 'false');
    expect(panel).not.toBeVisible();
    fireEvent.click(first);
    expect(panel).toHaveAttribute('data-open', 'true');
    expect(panel).toBeVisible();
  });
});

describe('motion.css respects "reduce motion"', () => {
  const css = readFileSync(resolve(import.meta.dirname, '../src/styles/motion.css'), 'utf8');

  /** Removes the body of every `@media (prefers-reduced-motion: no-preference) { ... }` block. */
  function withoutMotionBlocks(src: string) {
    let out = src;
    for (;;) {
      const at = out.indexOf('@media (prefers-reduced-motion: no-preference)');
      if (at < 0) return out;
      const open = out.indexOf('{', at);
      let depth = 1;
      let i = open + 1;
      while (depth > 0 && i < out.length) {
        if (out[i] === '{') depth++;
        else if (out[i] === '}') depth--;
        i++;
      }
      out = out.slice(0, at) + out.slice(i);
    }
  }

  it('has a no-preference block and defines keyframes', () => {
    expect(css).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(css).toMatch(/@keyframes rise/);
  });

  it('starts no animation outside the no-preference block', () => {
    const outside = withoutMotionBlocks(css).replace(/@keyframes[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
    expect(outside).not.toMatch(/animation\s*:/);
  });

  it('hides nothing outside the no-preference block (reveal states live inside it)', () => {
    expect(withoutMotionBlocks(css)).not.toMatch(/data-reveal/);
  });
});
