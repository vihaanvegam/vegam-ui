import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Avatar, avatarClasses } from './Avatar';

describe('Avatar', () => {
  it('shows initials derived from the name', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('uses one initial for a single-word name', () => {
    render(<Avatar name="Ada" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('uses the first and LAST word for three-part names', () => {
    render(<Avatar name="Ada King Lovelace" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('does not split a multi-code-unit grapheme', () => {
    // A naive charAt would return half a surrogate pair here.
    render(<Avatar name="🎉 Party" />);
    expect(screen.getByText('🎉P')).toBeInTheDocument();
  });

  it('explicit initials win over the derived ones', () => {
    render(<Avatar name="Ada Lovelace" initials="AL2" />);
    expect(screen.getByText('AL2')).toBeInTheDocument();
  });

  it('renders the image with the name as alt', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />);
    const img = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(img).toHaveAttribute('src', '/ada.png');
  });

  it('falls back to initials when the image fails', () => {
    render(<Avatar name="Ada Lovelace" src="/broken.png" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is hidden from assistive tech without a name', () => {
    const { container } = render(<Avatar>?</Avatar>);
    expect(container.querySelector(`.${avatarClasses.root}`)).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('falls back to children when there is no src and no name', () => {
    render(<Avatar>ICON</Avatar>);
    expect(screen.getByText('ICON')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('applies the %s size', (size) => {
    const { container } = render(<Avatar name="A B" size={size} />);
    expect(container.querySelector(`.${avatarClasses.root}`)).toHaveClass(avatarClasses[size]);
  });

  it.each(['circle', 'square'] as const)('applies the %s shape', (shape) => {
    const { container } = render(<Avatar name="A B" shape={shape} />);
    expect(container.querySelector(`.${avatarClasses.root}`)).toHaveClass(avatarClasses[shape]);
  });

  it('honors theme defaults, explicit winning', () => {
    const { container } = render(
      <ThemeProvider componentDefaults={{ Avatar: { size: 'xl', shape: 'square' } }}>
        <Avatar name="T H" />
        <Avatar name="E X" size="sm" />
      </ThemeProvider>,
    );
    const [themed, explicit] = container.querySelectorAll(`.${avatarClasses.root}`);
    expect(themed).toHaveClass(avatarClasses.xl, avatarClasses.square);
    expect(explicit).toHaveClass(avatarClasses.sm);
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Avatar
        ref={(el) => {
          node = el;
        }}
        name="A B"
        className="custom"
        data-testid="av"
      />,
    );
    expect(screen.getByTestId('av')).toHaveClass(avatarClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });
});
