import { cx } from '@vegam-ui/ui';
import { IconSearch } from '@vegam-ui/icons';

export default function Index() {
  return (
    <main className={cx('smoke', 'smoke--remix')}>
      <IconSearch title="Search" size="md" />
      smoke-remix consuming @vegam-ui/ui
    </main>
  );
}
