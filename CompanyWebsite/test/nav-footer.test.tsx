import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Footer } from '../src/components/Footer';
import { Logo } from '../src/components/Logo';
import { Nav } from '../src/components/Nav';
import { en } from '../src/content/en';
import { renderWithProviders } from './utils';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'dark';
});

describe('Logo', () => {
  it('the stacked logo uses the dark-theme image by default and has alt text', () => {
    const { container } = renderWithProviders(<Logo variant="stacked" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/logos/loading-dark.png');
    expect(screen.getByAltText('AniLink')).toBeInTheDocument();
  });

  it('the lockup flips its wordmark when the theme changes', async () => {
    const { container } = renderWithProviders(
      <>
        <Logo variant="lockup" />
        <Nav />
      </>,
    );
    const wordmarks = () => Array.from(container.querySelectorAll('img[src*="loading-"]')).map((i) => i.getAttribute('src'));
    expect(wordmarks().every((s) => s === '/logos/loading-dark.png')).toBe(true);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: en['toggle.themeLight'] })[0]);
    expect(wordmarks().every((s) => s === '/logos/loading-light.png')).toBe(true);
  });

  it('is exposed to assistive tech as AniLink', () => {
    renderWithProviders(<Logo variant="lockup" />);
    expect(screen.getByRole('img', { name: 'AniLink' })).toBeInTheDocument();
  });
});

describe('Nav', () => {
  it('links to each section anchor', () => {
    renderWithProviders(<Nav />);
    expect(screen.getByRole('link', { name: en['nav.features'] })).toHaveAttribute('href', '#features');
    expect(screen.getByRole('link', { name: en['nav.how'] })).toHaveAttribute('href', '#how');
    expect(screen.getByRole('link', { name: en['nav.about'] })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: en['nav.faq'] })).toHaveAttribute('href', '#faq');
  });

  it('"Get the app" opens the store facade', async () => {
    renderWithProviders(<Nav />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: en['nav.getApp'] }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Google Play');
  });

  it('has a language toggle and a theme toggle', () => {
    renderWithProviders(<Nav />);
    expect(screen.getByRole('group', { name: en['toggle.language'] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: en['toggle.themeLight'] })).toBeInTheDocument();
  });

  it('the hamburger opens and closes the full-screen menu', async () => {
    renderWithProviders(<Nav />);
    const user = userEvent.setup();
    const burger = screen.getByRole('button', { name: en['nav.menu'] });
    expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
    await user.click(burger);
    expect(screen.getByRole('button', { name: en['nav.closeMenu'] })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: en['nav.closeMenu'] }));
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
  });

  it('a menu link closes the menu, and Escape closes it too', async () => {
    renderWithProviders(<Nav />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: en['nav.menu'] }));
    await user.click(within(screen.getByTestId('mobile-menu')).getByRole('link', { name: en['nav.features'] }));
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
    await user.click(screen.getByRole('button', { name: en['nav.menu'] }));
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
  });
});

describe('Footer', () => {
  it('has no Privacy, Terms or Photo credits links for now, so no buttons or dialogs in the footer', () => {
    renderWithProviders(<Footer />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });

  it('shows the contact block with no placeholder tag, and no real personal details', () => {
    const { container } = renderWithProviders(
      <>
        <Nav />
        <Footer />
      </>,
    );
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/placeholder/i);
    // The one email on the page is the company address the owner chose, never a personal one.
    for (const email of text.match(/[\w.+-]+@[\w.-]+/g) ?? []) expect(email).toBe('anilink@gmail.com');
    expect(text.toLowerCase()).not.toContain('trinove');
  });
});
