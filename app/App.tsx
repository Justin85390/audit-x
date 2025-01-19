import { LanguageProvider } from './contexts/LanguageContext';

function App({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}

export default App; 