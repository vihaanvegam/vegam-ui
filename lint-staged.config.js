import path from 'node:path';

// Windows caps a command line at ~8k characters, and lint-staged appends every
// staged filename to each command. A phase landing in one commit blows past
// that, and the hook dies with "The command line is too long." Above the
// threshold we lint the whole repo instead — same result, one short command.
// (`pnpm lint` / `pnpm format:check` in CI run exactly these repo-wide forms.)
const MAX_ARGS_LENGTH = 6000;

const rel = (files) => files.map((f) => path.relative(process.cwd(), f));

const args = (files) => {
  const paths = rel(files);
  return paths.join(' ').length > MAX_ARGS_LENGTH ? '.' : paths.join(' ');
};

export default {
  '*.{ts,tsx,js,jsx,cjs,mjs}': (files) => [
    `eslint --fix ${args(files)}`,
    `prettier --write ${args(files)}`,
  ],
  '*.{json,md,css,scss,yml,yaml}': (files) => [`prettier --write ${args(files)}`],
};
