import { cx } from '@vegam-ui/ui';
import { IconSearch } from '@vegam-ui/icons';

export default function Home() {
  return (
    <main className={cx('smoke', 'smoke--next-pages')}>
      <IconSearch title="Search" size="md" />
      smoke-next-pages (Pages Router, legacy module resolution) consuming @vegam-ui/ui
    </main>
  );
}
