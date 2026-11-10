'use client';

// In a server component, next/link resolves to a server wrapper, which can't
// be passed to a client component such as NavBarLink. Re-exporting it from a
// client module passes a client reference instead.
export { default } from 'next/link';
