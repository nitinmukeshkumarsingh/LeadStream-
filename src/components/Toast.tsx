import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing } from 'lucide-react';

export default function Toast({
  message,
  isVisible,
  onClose,
}: {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {}

      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="absolute top-4 left-4 right-4 z-50 flex flex-row justify-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="bg-[#00FF00] px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,255,0,0.4)] flex flex-row items-center gap-4 max-w-sm w-full"
          >
            <div className="bg-black/10 p-2 rounded-full">
              <BellRing className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-sm text-black">
                {message}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
