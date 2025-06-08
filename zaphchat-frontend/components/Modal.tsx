import React, { useEffect, useState } from 'react';

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

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-start md:items-center justify-center overflow-y-auto py-8 z-50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`transform transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-4'} ${containerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
