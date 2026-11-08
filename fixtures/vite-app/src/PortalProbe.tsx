import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Stands in for a dialog until one exists: it renders outside the app's root.
export function PortalProbe() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div
      data-testid="portal"
      style={{ backgroundColor: 'var(--ds-color-bg-accent)' }}
    >
      Portal
    </div>,
    document.body,
  );
}
