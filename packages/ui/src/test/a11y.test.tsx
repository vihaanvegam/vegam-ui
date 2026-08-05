/**
 * Automated accessibility tests for all components.
 *
 * Uses vitest-axe to run axe-core checks against rendered components.
 * This catches WCAG violations that manual review might miss.
 */
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';

import {
  Button,
  Input,
  Text,
  Card,
  Badge,
  Banner,
  Blanket,
  Breadcrumbs,
  Modal,
  Stack,
  Checkbox,
  Select,
  ThemeProvider,
} from '../index';

describe('Accessibility', () => {
  describe('Button', () => {
    it('has no violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Input', () => {
    it('has no violations with label', async () => {
      const { container } = render(
        <div>
          <label htmlFor="test-input">Email</label>
          <Input id="test-input" type="email" />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations with aria-label', async () => {
      const { container } = render(<Input aria-label="Search" type="search" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Text', () => {
    it('has no violations as paragraph', async () => {
      const { container } = render(<Text>Hello world</Text>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations as heading', async () => {
      const { container } = render(
        <Text as="h1" size="display">
          Page Title
        </Text>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Card', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Card>
          <Text>Card content</Text>
        </Card>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Badge', () => {
    it('has no violations', async () => {
      const { container } = render(<Badge>New</Badge>);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Banner', () => {
    it('has no violations for info', async () => {
      const { container } = render(
        <Banner title="Information" intent="info">
          This is an informational message.
        </Banner>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations for danger with close', async () => {
      const { container } = render(
        <Banner title="Error" intent="danger" onClose={() => {}} closeLabel="Dismiss">
          Something went wrong.
        </Banner>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Blanket', () => {
    it('has no violations', async () => {
      const { container } = render(<Blanket />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Breadcrumbs', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Widget' },
          ]}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Modal', () => {
    it('has no violations when open', async () => {
      const { container } = render(
        <Modal
          open
          onClose={() => {}}
          title="Confirm action"
          description="Are you sure you want to proceed?"
        >
          <Text>Modal body content</Text>
        </Modal>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Stack', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Stack gap={4}>
          <Text>Item 1</Text>
          <Text>Item 2</Text>
        </Stack>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Checkbox', () => {
    it('has no violations with label', async () => {
      const { container } = render(
        <div>
          <Checkbox id="agree" />
          <label htmlFor="agree">I agree to the terms</label>
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations with aria-label', async () => {
      const { container } = render(<Checkbox aria-label="Subscribe to newsletter" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Select', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Select
          aria-label="Country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
          ]}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('ThemeProvider', () => {
    it('has no violations in light mode', async () => {
      const { container } = render(
        <ThemeProvider colorScheme="light">
          <Text>Themed content</Text>
        </ThemeProvider>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations in dark mode', async () => {
      const { container } = render(
        <ThemeProvider colorScheme="dark">
          <Text>Themed content</Text>
        </ThemeProvider>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
