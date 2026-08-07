import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../Input';
import { Select } from '../Select';
import { Field, fieldClasses } from './Field';

describe('Field', () => {
  it('associates the label with the wrapped Input via generated ids', () => {
    render(
      <Field label="Email">
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toBeInstanceOf(HTMLInputElement);
  });

  it('wires description and error into aria-describedby and sets aria-invalid', () => {
    render(
      <Field label="Email" description="Work address" error="Required">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    const ids = describedBy.split(' ');
    expect(ids).toHaveLength(2);
    const [descriptionId, errorId] = ids;
    expect(document.getElementById(descriptionId ?? '')).toHaveTextContent('Work address');
    expect(document.getElementById(errorId ?? '')).toHaveTextContent('Required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('without an error there is no error node and no aria-invalid', () => {
    render(
      <Field label="Email" description="Work address">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect((input.getAttribute('aria-describedby') ?? '').split(' ')).toHaveLength(1);
  });

  it('required sets aria-required and renders the marker slot aria-hidden', () => {
    render(
      <Field label="Email" required requiredMarker="*">
        <Input />
      </Field>,
    );
    // The marker sits inside the label element, so match its text loosely.
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-required', 'true');
    const marker = document.querySelector(`.${fieldClasses.required}`);
    expect(marker).toHaveTextContent('*');
    expect(marker).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders no marker without requiredMarker (no shipped copy)', () => {
    render(
      <Field label="Email" required>
        <Input />
      </Field>,
    );
    expect(document.querySelector(`.${fieldClasses.required}`)).toBeNull();
  });

  it('disabled propagates to the control and dims the field', () => {
    render(
      <Field label="Email" disabled>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(document.querySelector(`.${fieldClasses.root}`)).toHaveClass(fieldClasses.disabled);
  });

  it('explicit control props beat the field wiring', () => {
    render(
      <Field label="Email" error="Bad">
        <Input id="custom-id" aria-invalid={false} aria-describedby="external" />
      </Field>,
    );
    const input = document.getElementById('custom-id');
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'external');
  });

  it("wires Select's combobox trigger the same way", () => {
    render(
      <Field label="Fruit" error="Pick one">
        <Select options={[{ value: 'a', label: 'Apple' }]} placeholder="Choose" />
      </Field>,
    );
    const trigger = screen.getByRole('combobox');
    expect(screen.getByLabelText('Fruit')).toBe(trigger);
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Field
        ref={(el) => {
          node = el;
        }}
        label="L"
        className="custom"
        data-testid="field"
      >
        <Input />
      </Field>,
    );
    const el = screen.getByTestId('field');
    expect(el).toHaveClass(fieldClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
