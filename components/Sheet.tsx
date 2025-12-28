import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90vh] flex-col rounded-t-[24px] bg-white shadow-xl"
          >
            {/* Header / Handle */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="flex-1">
                 <div className="mx-auto h-1.5 w-12 rounded-full bg-zinc-200 mb-4" />
                 {title && <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>}
              </div>
              {/* Optional Close Button for Desktop/Accessibility */}
              <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100 md:hidden">
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-0 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};