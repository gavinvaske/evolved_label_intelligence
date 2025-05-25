import { useState, useCallback } from 'react';
import { ConfirmationModal } from './ConfirmationModal';

type ConfirmationOptions = {
  title?: string;
  message: string | JSX.Element;
  confirmText?: string;
  cancelText?: string;
};

export type ConfirmationResult = {
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
  ConfirmationDialog: () => JSX.Element | null;
};

export const useConfirmation = (): ConfirmationResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showConfirmation = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resolvePromise?.(false);
  }, [resolvePromise]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolvePromise?.(true);
  }, [resolvePromise]);

  const ConfirmationDialog = useCallback(() => {
    if (!isOpen || !options) return null;

    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title || 'Confirm Action'}
        message={options.message}
        confirmText={options.confirmText || 'Confirm'}
        cancelText={options.cancelText || 'Cancel'}
      />
    );
  }, [isOpen, options, handleClose, handleConfirm]);

  return {
    showConfirmation,
    ConfirmationDialog,
  };
}; 