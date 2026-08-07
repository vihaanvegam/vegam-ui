import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Field } from '../Field';
import { Textarea, textareaClasses } from './Textarea';

describe('Textarea', () => {
  it('renders a native textarea and accepts typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" onChange={onChange} />);
    const el = screen.getByRole('textbox');
    expect(el).toBeInstanceOf(HTMLTextAreaElement);
    expect(el).toHaveClass(textareaClasses.root, textareaClasses.md);
    await user.type(el, 'hi');
    expect(onChange).toHaveBeenCalled();
    expect(el).toHaveValue('hi');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies the %s size class', (size) => {
    render(<Textarea aria-label="t" size={size} />);
    expect(screen.getByRole('textbox')).toHaveClass(textareaClasses[size]);
  });

  it('fixed mode: uses the native rows attribute, no autosize class', () => {
    render(<Textarea aria-label="t" rows={5} />);
    const el = screen.getByRole('textbox');
    expect(el).toHaveAttribute('rows', '5');
    expect(el).not.toHaveClass(textareaClasses.autosize);
  });

  it('minRows/maxRows opt into autosize', () => {
    render(<Textarea aria-label="t" minRows={3} maxRows={6} />);
    const el = screen.getByRole('textbox');
    expect(el).toHaveClass(textareaClasses.autosize);
    expect(el).toHaveAttribute('rows', '3');
  });

  it('maxRows alone implies autosize with the default minimum', () => {
    render(<Textarea aria-label="t" maxRows={8} />);
    const el = screen.getByRole('textbox');
    expect(el).toHaveClass(textareaClasses.autosize);
    expect(el).toHaveAttribute('rows', '2');
  });

  // measure() writes an inline block-size that outranks the class rules and
  // the rows attribute, so turning autosize off must clear it.
  it('clears the autosized inline height when autosize is switched off', () => {
    const { rerender } = render(<Textarea aria-label="t" minRows={4} />);
    const el = screen.getByRole('textbox') as HTMLTextAreaElement;
    el.style.blockSize = '128px'; // stand in for a real measurement
    rerender(<Textarea aria-label="t" rows={2} />);
    expect(el.style.blockSize).toBe('');
    expect(el).not.toHaveClass(textareaClasses.autosize);
    expect(el).toHaveAttribute('rows', '2');
  });

  it('wires up inside a Field, explicit props winning', () => {
    render(
      <Field label="Notes" description="Optional" error="Too long" disabled>
        <Textarea />
      </Field>,
    );
    const el = screen.getByLabelText('Notes');
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('aria-invalid', 'true');
    expect(el.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
  });

  it('honors theme default size, explicit winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Textarea: { size: 'lg' } }}>
        <Textarea aria-label="themed" />
        <Textarea aria-label="explicit" size="sm" />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('themed')).toHaveClass(textareaClasses.lg);
    expect(screen.getByLabelText('explicit')).toHaveClass(textareaClasses.sm);
  });

  it('disabled is inert; merges className; forwards ref', () => {
    let node: HTMLTextAreaElement | null = null;
    render(
      <Textarea
        ref={(el) => {
          node = el;
        }}
        aria-label="t"
        disabled
        className="custom"
        data-testid="ta"
      />,
    );
    const el = screen.getByTestId('ta');
    expect(el).toBeDisabled();
    expect(el).toHaveClass('custom');
    expect(node).toBeInstanceOf(HTMLTextAreaElement);
  });
});
