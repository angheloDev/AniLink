import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { OtpInput } from '../src/components/OtpInput';
import { isEmail, validateCredentials } from '../src/lib/validate';
import { ThemeProvider } from '../src/theme/ThemeProvider';

describe('isEmail', () => {
  it('accepts normal addresses and rejects malformed ones', () => {
    expect(isEmail('carla@gmail.com')).toBe(true);
    expect(isEmail('  carla.m+test@mail.co.ph ')).toBe(true);
    expect(isEmail('carla@')).toBe(false);
    expect(isEmail('carla.gmail.com')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
});

describe('validateCredentials', () => {
  it('returns translation keys for each invalid field', () => {
    expect(validateCredentials({ email: 'nope', password: '123' })).toEqual({ email: 'auth.errInvalidEmail', password: 'auth.errShortPassword' });
  });

  it('is empty when everything is valid', () => {
    expect(validateCredentials({ email: 'a@b.co', password: 'secret1' })).toEqual({});
  });

  it('requires a name only when asked to', () => {
    expect(validateCredentials({ email: 'a@b.co', password: 'secret1', name: '  ' }, { requireName: true })).toEqual({ name: 'auth.errRequired' });
    expect(validateCredentials({ email: 'a@b.co', password: 'secret1' })).toEqual({});
  });
});

describe('OtpInput', () => {
  const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

  it('keeps only digits and caps the length', async () => {
    const onChange = jest.fn();
    await wrap(<OtpInput value="" onChange={onChange} length={6} />);
    await fireEvent.changeText(screen.getByTestId('otp-input'), '12a4-5678');
    expect(onChange).toHaveBeenCalledWith('124567');
  });

  it('shows one box per digit and fills them from the value', async () => {
    await wrap(<OtpInput value="482" onChange={() => {}} length={6} />);
    expect(screen.getAllByTestId('otp-box')).toHaveLength(6);
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('reports completion once all digits are entered', async () => {
    const onComplete = jest.fn();
    await wrap(<OtpInput value="" onChange={() => {}} onComplete={onComplete} length={4} />);
    await fireEvent.changeText(screen.getByTestId('otp-input'), '1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });
});
