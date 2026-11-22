import { About } from './components/About';
import { Download } from './components/Download';
import { Faq } from './components/Faq';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Nav } from './components/Nav';
import { Produce } from './components/Produce';
import { Stats } from './components/Stats';
import { I18nProvider, useI18n } from './lib/i18n';
import { StoreProvider } from './lib/store';
import { ThemeProvider } from './lib/theme';

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-text"
    >
      {t('nav.skip')}
    </a>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <StoreProvider>
          <SkipLink />
          <Nav />
          <main id="main">
            <Hero />
            <Stats />
            <Features />
            <HowItWorks />
            <Produce />
            <About />
            <Faq />
            <Download />
          </main>
          <Footer />
        </StoreProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
