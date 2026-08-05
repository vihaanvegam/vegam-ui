import { describe, expect, it } from 'vitest';
import { lockScroll } from './scrollLock';

describe('lockScroll', () => {
  it('hides body overflow and restores the previous inline styles on unlock', () => {
    document.body.style.overflow = 'scroll';
    const unlock = lockScroll(document);
    expect(document.body.style.overflow).toBe('hidden');
    unlock();
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });

  it('restores an empty inline style when none was set', () => {
    const unlock = lockScroll(document);
    expect(document.body.style.overflow).toBe('hidden');
    unlock();
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('');
  });
});
