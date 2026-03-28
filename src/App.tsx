/// <reference types="vite/client" />
import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AnimatePresence } from 'motion/react';
import { useAppStore, EmailMessage } from './store/useAppStore';
import Login from './components/Login';
import Setup from './components/Setup';
import Inbox from './components/Inbox';
import EmailDetail from './components/EmailDetail';
import Toast from './components/Toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id-to-bypass';

export default function App() {
  const { accessToken, sources, emails } = useAppStore();
  const [showSetup, setShowSetup] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [prevEmailCount, setPrevEmailCount] = useState(0);

  const isAuthenticated = !!accessToken;
  const needsSetup = sources.length === 0;

  useEffect(() => {
    if (isAuthenticated && needsSetup) {
      setShowSetup(true);
    } else if (isAuthenticated && !needsSetup) {
      setShowSetup(false);
    }
  }, [isAuthenticated, needsSetup]);

  useEffect(() => {
    if (emails.length > prevEmailCount && prevEmailCount > 0) {
      const newCount = emails.length - prevEmailCount;
      setToastMessage(`You have ${newCount} new business inquir${newCount > 1 ? 'ies' : 'y'}!`);
    }
    setPrevEmailCount(emails.length);
  }, [emails.length, prevEmailCount]);

  useEffect(() => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch (e) {
      // Ignore in WebViews where Notification might be restricted or undefined
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || needsSetup) return;

    const interval = setInterval(() => {
      const unreadCount = useAppStore.getState().emails.filter(e => e.isUnread).length;
      try {
        if (unreadCount > 0 && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('LeadStream', {
            body: `You have ${unreadCount} unread business inquiries waiting!`,
            icon: './vite.svg',
          });
        }
      } catch (e) {
        // Ignore in WebViews
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, needsSetup]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex-1 min-h-screen bg-[#121212] flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-md bg-[#121212] shadow-2xl relative h-[100dvh] overflow-hidden flex flex-col">
          
          <Toast 
            message={toastMessage} 
            isVisible={!!toastMessage} 
            onClose={() => setToastMessage('')} 
          />

          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <Login key="login" />
            ) : showSetup ? (
              <Setup key="setup" onComplete={() => setShowSetup(false)} />
            ) : (
              <Inbox 
                key="inbox" 
                onOpenSettings={() => setShowSetup(true)} 
                onOpenEmail={setSelectedEmail} 
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedEmail && (
              <EmailDetail 
                key="detail" 
                email={selectedEmail} 
                onClose={() => setSelectedEmail(null)} 
              />
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
