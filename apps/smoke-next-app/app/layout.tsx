import '@vegam-ui/ui/styles.css';
import type { ReactNode } from 'react';
import { IconSearch } from '@vegam-ui/icons';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/*
          This file is a SERVER component — no 'use client' here or anywhere
          above it. Rendering an icon from it is the gate that proves
          @vegam-ui/icons is genuinely RSC-safe; if a directive, hook or
          browser global ever leaks into the package, `next build` fails here.
        */}
        <IconSearch title="Search" size="md" />
        {children}
      </body>
    </html>
  );
}
