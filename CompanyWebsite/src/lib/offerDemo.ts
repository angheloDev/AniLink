/** The scripted negotiation shown in the "Offers in chat" demo. A tiny, pure state machine. */
export type OfferStage = 'idle' | 'proposed' | 'countered' | 'accepted';

export interface OfferEvent {
  by: 'buyer' | 'farmer';
  kind: 'offer' | 'counter' | 'accept';
  price: number;
  qty: number;
}

export interface OfferDemoState {
  stage: OfferStage;
  history: OfferEvent[];
}

export type OfferAction = { type: 'propose' | 'counter' | 'accept' | 'reset' };

/** Sample listing: Carabao Mangoes, asking ₱130/kg. */
export const OFFER = { asking: 130, price: 120, counterPrice: 128, qty: 10 } as const;

export const initialOfferDemo: OfferDemoState = { stage: 'idle', history: [] };

export function offerDemoReducer(state: OfferDemoState, action: OfferAction): OfferDemoState {
  switch (action.type) {
    case 'reset':
      return initialOfferDemo;
    case 'propose':
      return state.stage === 'idle'
        ? { stage: 'proposed', history: [{ by: 'buyer', kind: 'offer', price: OFFER.price, qty: OFFER.qty }] }
        : state;
    case 'counter':
      return state.stage === 'proposed'
        ? { stage: 'countered', history: [...state.history, { by: 'farmer', kind: 'counter', price: OFFER.counterPrice, qty: OFFER.qty }] }
        : state;
    case 'accept':
      return state.stage === 'countered'
        ? { stage: 'accepted', history: [...state.history, { by: 'buyer', kind: 'accept', price: OFFER.counterPrice, qty: OFFER.qty }] }
        : state;
  }
}

/** The action that moves the story forward from a stage, or null when it has ended. */
export function nextAction(stage: OfferStage): 'propose' | 'counter' | 'accept' | null {
  return stage === 'idle' ? 'propose' : stage === 'proposed' ? 'counter' : stage === 'countered' ? 'accept' : null;
}
