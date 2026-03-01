import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ isOpen, title, subtitle, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="ui-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ui-modal__header">
          <div>
            <h3 className="ui-modal__title">{title}</h3>
            {subtitle ? <p className="ui-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button className="ui-icon-button ui-icon-button--outline" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="ui-modal__content">{children}</div>
      </div>
    </div>
  );
}
