// Simple toast implementation using react-hot-toast
import toast from 'react-hot-toast';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const showToast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = title && description ? `${title}: ${description}` : title || description || '';
    
    if (variant === 'destructive') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  return {
    toast: showToast,
  };
};

export const toast = useToast().toast;
