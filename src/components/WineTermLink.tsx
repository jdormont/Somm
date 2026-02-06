import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { WineKnowledgeModal } from './WineKnowledgeModal';

interface WineTermLinkProps {
  term: string;
  children: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function WineTermLink({ term, children, showIcon = false, className = '' }: WineTermLinkProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer ${className}`}
        type="button"
      >
        {children}
        {showIcon && <HelpCircle size={14} className="opacity-60" />}
      </button>

      {showModal && (
        <WineKnowledgeModal
          term={term}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
