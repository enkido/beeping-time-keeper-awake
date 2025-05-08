
import React from 'react';
import StopwatchApp from '@/components/StopwatchApp';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-purple-100 dark:from-gray-900 dark:to-purple-950">
      <header className="w-full py-6 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-timer-dark">Interval Stoppuhr</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Stoppt die Zeit und piept in konfigurierbaren Intervallen
        </p>
        <p className="text-xs text-amber-600 mt-2">
          Bitte erlauben Sie Audioberechtigungen und klicken Sie auf den Bildschirm, um die Audiofunktion zu aktivieren.
        </p>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <StopwatchApp />
      </main>
      
      <footer className="w-full py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Interval Stoppuhr</p>
      </footer>
    </div>
  );
};

export default Index;
