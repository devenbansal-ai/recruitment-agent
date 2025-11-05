import React from "react";
import { Loader2 } from "lucide-react"; // lightweight icon from lucide-react
import { motion, AnimatePresence } from "framer-motion";

type UploadingOverlayProps = {
  isVisible: boolean;
  message?: string;
};

export const UploadingOverlay: React.FC<UploadingOverlayProps> = ({
  isVisible,
  message = "Uploading your file...",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white shadow-xl dark:bg-gray-900"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
