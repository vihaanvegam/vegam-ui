'use client';

import { useState } from 'react';
import { cx, useIsomorphicLayoutEffect } from '@vegam-ui/ui';

export default function Page() {
  const [hydrated, setHydrated] = useState(false);
  useIsomorphicLayoutEffect(() => {
    setHydrated(true);
  }, []);
  return (
    <main className={cx('smoke', hydrated && 'smoke--hydrated')}>
      smoke-next-app (App Router) consuming @vegam-ui/ui
    </main>
  );
}
