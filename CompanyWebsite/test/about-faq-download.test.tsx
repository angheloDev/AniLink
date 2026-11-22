import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { About } from '../src/components/About';
import { Download } from '../src/components/Download';
import { Faq } from '../src/components/Faq';
import { en } from '../src/content/en';
import { renderWithProviders } from './utils';

beforeEach(() => localStorage.clear());

describe('About', () => {
  it('labels its mission copy and every team card as placeholder, with no email address', () => {
    const { container } = renderWithProviders(<About />);
    expect(screen.getAllByText(en['about.placeholder']).length).toBeGreaterThanOrEqual(4);
    expect(container.textContent ?? '').not.toMatch(/[\w.+-]+@[\w.-]+/);
    expect(screen.getAllByTestId('team-card')).toHaveLength(3);
    expect(screen.getAllByTestId('value-card')).toHaveLength(3);
  });
});

describe('Faq', () => {
  const triggers = () => screen.getAllByRole('button', { name: /./ });

  it('has at least six questions, all collapsed at first', () => {
    renderWithProviders(<Faq />);
    expect(triggers().length).toBeGreaterThanOrEqual(6);
    expect(triggers().every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true);
  });

  it('opening one closes the previous one, and the trigger controls its panel', () => {
    renderWithProviders(<Faq />);
    fireEvent.click(triggers()[0]);
    expect(triggers()[0]).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(triggers()[0].getAttribute('aria-controls') ?? '');
    expect(panel).not.toBeNull();
    expect(panel).toBeVisible();
    fireEvent.click(triggers()[1]);
    expect(triggers()[0]).toHaveAttribute('aria-expanded', 'false');
    expect(triggers()[1]).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toBeVisible();
  });

  it('clicking the open question again closes it', () => {
    renderWithProviders(<Faq />);
    fireEvent.click(triggers()[2]);
    fireEvent.click(triggers()[2]);
    expect(triggers()[2]).toHaveAttribute('aria-expanded', 'false');
  });

  it('Enter and Space toggle a question from the keyboard', async () => {
    renderWithProviders(<Faq />);
    const user = userEvent.setup();
    triggers()[0].focus();
    await user.keyboard('{Enter}');
    expect(triggers()[0]).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(triggers()[0]).toHaveAttribute('aria-expanded', 'false');
  });

  it('answers truthfully: payments are a demo and the app is Android-first', () => {
    expect(en['faq.payments.a']).toMatch(/demo/i);
    expect(en['faq.platforms.a']).toMatch(/Android/);
  });
});

describe('Download', () => {
  it('has both store buttons and a QR code; each button opens the facade', () => {
    renderWithProviders(<Download />);
    expect(screen.getByTestId('qr-card')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Google Play/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Google Play');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: /App Store/ }));
    expect(within(screen.getByRole('dialog')).getByRole('heading')).toHaveTextContent('App Store');
  });
});
