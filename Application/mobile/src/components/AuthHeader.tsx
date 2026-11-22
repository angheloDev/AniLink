import React from 'react';
import { LanguageToggle } from './LanguageToggle';
import { ScreenHeader } from './ScreenHeader';

type Props = Omit<React.ComponentProps<typeof ScreenHeader>, 'right'>;

/** Header for the sign-in and onboarding pages: back button on the left, the EN | TL switch always on the right. */
export function AuthHeader(props: Props) {
  return <ScreenHeader {...props} right={<LanguageToggle />} />;
}
