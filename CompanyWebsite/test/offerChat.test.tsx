import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PhoneFrame } from '../src/components/PhoneFrame';
import { COOLDOWN_MS, OfferChatScreen } from '../src/components/screens/OfferChatScreen';
import { en } from '../src/content/en';
import { initialOfferDemo, offerDemoReducer } from '../src/lib/offerDemo';
import { renderWithProviders } from './utils';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => vi.useRealTimers());

const next = () => act(() => void vi.advanceTimersByTime(COOLDOWN_MS));
const actionButton = () => screen.getByTestId('offer-action');

describe('PhoneFrame', () => {
  it('renders its children inside a labelled device', () => {
    renderWithProviders(
      <PhoneFrame label="App preview">
        <p>inside</p>
      </PhoneFrame>,
    );
    expect(screen.getByRole('group', { name: 'App preview' })).toHaveTextContent('inside');
  });
});

describe('OfferChatScreen (interactive)', () => {
  it('walks propose -> counter -> accept with one contextual button and ends on "Order created"', () => {
    renderWithProviders(<OfferChatScreen />);
    expect(actionButton()).toHaveTextContent('Send offer ₱120 × 10 kg');
    fireEvent.click(actionButton());
    next();
    expect(screen.getByText(en['offer.cardOffer'])).toBeInTheDocument();
    expect(actionButton()).toHaveTextContent('Farmer counters ₱128');
    fireEvent.click(actionButton());
    next();
    expect(screen.getByText(en['offer.cardCounter'])).toBeInTheDocument();
    expect(actionButton()).toHaveTextContent('Accept ₱128');
    fireEvent.click(actionButton());
    next();
    expect(screen.getByText(en['offer.orderCreated'])).toBeInTheDocument();
    expect(screen.queryByTestId('offer-action')).toBeNull();
    // the negotiation history is still visible
    expect(screen.getByText(en['offer.cardOffer'])).toBeInTheDocument();
    expect(screen.getByText(en['offer.cardCounter'])).toBeInTheDocument();
  });

  it('double-clicking the first button adds one offer card and does not skip the farmer', () => {
    renderWithProviders(<OfferChatScreen />);
    fireEvent.click(actionButton());
    fireEvent.click(actionButton());
    expect(screen.getAllByText(en['offer.cardOffer'])).toHaveLength(1);
    expect(screen.queryByText(en['offer.cardCounter'])).toBeNull();
    next();
    expect(actionButton()).toHaveTextContent('Farmer counters ₱128');
  });

  it('Reset returns to the start from any stage, including mid-cooldown', () => {
    renderWithProviders(<OfferChatScreen />);
    fireEvent.click(actionButton());
    fireEvent.click(screen.getByRole('button', { name: en['offer.reset'] }));
    expect(screen.queryByText(en['offer.cardOffer'])).toBeNull();
    expect(actionButton()).toHaveTextContent('Send offer ₱120 × 10 kg');
    next();
    expect(screen.queryByText(en['offer.cardOffer'])).toBeNull();
  });
});

describe('OfferChatScreen (static)', () => {
  it('interactive={false} renders the given state with no controls', () => {
    const state = offerDemoReducer(offerDemoReducer(initialOfferDemo, { type: 'propose' }), { type: 'counter' });
    renderWithProviders(<OfferChatScreen initial={state} interactive={false} />);
    expect(screen.getByText(en['offer.cardCounter'])).toBeInTheDocument();
    expect(screen.queryByTestId('offer-action')).toBeNull();
    expect(screen.queryByRole('button', { name: en['offer.reset'] })).toBeNull();
  });
});
