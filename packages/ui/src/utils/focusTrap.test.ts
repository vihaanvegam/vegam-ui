import { afterEach, describe, expect, it } from 'vitest';
import { getTabbables, nextTrapTarget } from './focusTrap';

function mount(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('getTabbables', () => {
  it('returns focusable elements in DOM order', () => {
    const root = mount(
      '<a href="#one">one</a><button>two</button><input /><select></select><textarea></textarea>',
    );
    expect(getTabbables(root).map((el) => el.tagName)).toEqual([
      'A',
      'BUTTON',
      'INPUT',
      'SELECT',
      'TEXTAREA',
    ]);
  });

  it('skips disabled controls, negative tabindex, hidden inputs, and aria-hidden subtrees', () => {
    const root = mount(
      '<button disabled>no</button><button tabindex="-1">no</button>' +
        '<input type="hidden" /><div aria-hidden="true"><button>no</button></div>' +
        '<a>no anchor without href</a><span tabindex="0">yes</span>',
    );
    const tabbables = getTabbables(root);
    expect(tabbables).toHaveLength(1);
    expect(tabbables[0]?.tagName).toBe('SPAN');
  });
});

describe('nextTrapTarget', () => {
  it('wraps forward from the last tabbable to the first', () => {
    const root = mount('<button id="first">a</button><button id="last">b</button>');
    const target = nextTrapTarget(root, root.querySelector('#last'), false);
    expect(target?.id).toBe('first');
  });

  it('wraps backward from the first tabbable to the last', () => {
    const root = mount('<button id="first">a</button><button id="last">b</button>');
    const target = nextTrapTarget(root, root.querySelector('#first'), true);
    expect(target?.id).toBe('last');
  });

  it('returns null for moves that stay inside the trap', () => {
    const root = mount(
      '<button id="first">a</button><button id="mid">b</button><button>c</button>',
    );
    expect(nextTrapTarget(root, root.querySelector('#mid'), false)).toBeNull();
    expect(nextTrapTarget(root, root.querySelector('#mid'), true)).toBeNull();
  });

  it('pulls focus back inside when the active element is outside the trap', () => {
    const root = mount('<button id="first">a</button><button id="last">b</button>');
    expect(nextTrapTarget(root, document.body, false)?.id).toBe('first');
    expect(nextTrapTarget(root, document.body, true)?.id).toBe('last');
    expect(nextTrapTarget(root, null, false)?.id).toBe('first');
  });

  it('falls back to the root itself when nothing inside is tabbable', () => {
    const root = mount('<p>static</p>');
    expect(nextTrapTarget(root, document.body, false)).toBe(root);
  });
});
