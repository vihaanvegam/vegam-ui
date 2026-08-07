import { useState } from 'react';
import { cx, useIsomorphicLayoutEffect } from '@vegam-ui/ui';
import { IconSearch } from '@vegam-ui/icons';
import '@vegam-ui/ui/styles.css';

export default function App() {
  const [ready, setReady] = useState(false);
  useIsomorphicLayoutEffect(() => {
    setReady(true);
  }, []);
  return (
    <main className={cx('smoke', ready && 'smoke--ready')}>
      <IconSearch title="Search" size="md" />
      smoke-vite consuming @vegam-ui/ui
    </main>
  );
}
