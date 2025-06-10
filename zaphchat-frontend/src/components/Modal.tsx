import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  containerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, containerClassName = '' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 sm:p-8 overflow-y-auto max-h-screen transform transition-transform duration-300 ${visible ? 'scale-100' : 'scale-95'} ${containerClassName}`}
      >
        {children}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;

