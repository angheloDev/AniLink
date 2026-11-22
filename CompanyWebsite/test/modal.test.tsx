import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../src/components/Modal';

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>opener</button>
      <Modal
        open={open}
        title="Demo dialog"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <button>first</button>
        <button>last</button>
      </Modal>
    </div>
  );
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(
      <Modal open={false} title="x" onClose={() => {}}>
        <p>hidden</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a labelled dialog and moves focus inside on open', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('opener'));
    const dialog = screen.getByRole('dialog', { name: 'Demo dialog' });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('wraps Tab from the last control to the first, and Shift+Tab back', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('opener'));
    const dialog = screen.getByRole('dialog');
    const buttons = Array.from(dialog.querySelectorAll('button'));
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(first);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape and on backdrop click, but not on clicks inside', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);
    await user.click(screen.getByText('opener'));
    await user.click(screen.getByText('first'));
    expect(onClose).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText('opener'));
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('returns focus to the opener after closing', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByText('opener');
    await user.click(opener);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
