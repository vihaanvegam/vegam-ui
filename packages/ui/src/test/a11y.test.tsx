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
  Accordion,
  Avatar,
  Button,
  Chip,
  Input,
  Link,
  Pagination,
  Table,
  Tabs,
  Text,
  Card,
  Badge,
  Banner,
  Blanket,
  Box,
  Breadcrumbs,
  Container,
  Divider,
  Field,
  Flex,
  Grid,
  IconButton,
  Menu,
  Modal,
  Popover,
  Progress,
  Radio,
  RadioGroup,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  Switch,
  Textarea,
  ToastProvider,
  Tooltip,
  Drawer,
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

  describe('Box', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Box as="section" p={4} bg="subtle" radius="md" aria-label="Panel">
          <Text>Boxed content</Text>
        </Box>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Flex', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Flex gap={4} align="center">
          <Text>One</Text>
          <Text>Two</Text>
        </Flex>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Grid', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Grid columns={2} gap={4}>
          <Text>One</Text>
          <Text>Two</Text>
        </Grid>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Container', () => {
    it('has no violations as main', async () => {
      const { container } = render(
        <Container as="main" size="laptop">
          <Text>Page content</Text>
        </Container>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Divider', () => {
    it('has no violations horizontally', async () => {
      const { container } = render(
        <div>
          <Text>Above</Text>
          <Divider />
          <Text>Below</Text>
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations vertically', async () => {
      const { container } = render(
        <Flex gap={4}>
          <Text>Left</Text>
          <Divider orientation="vertical" />
          <Text>Right</Text>
        </Flex>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Field', () => {
    it('has no violations wiring an Input', async () => {
      const { container } = render(
        <Field label="Email" description="Work address preferred" error="Required" required>
          <Input type="email" />
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('IconButton', () => {
    it('has no violations with an aria-label', async () => {
      const { container } = render(
        <IconButton aria-label="Close">
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" />
        </IconButton>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Textarea', () => {
    it('has no violations with a label', async () => {
      const { container } = render(
        <Field label="Notes">
          <Textarea minRows={2} maxRows={6} />
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Radio + RadioGroup', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Field label="Plan">
          <RadioGroup defaultValue="a">
            <label>
              <Radio value="a" /> Basic
            </label>
            <label>
              <Radio value="b" /> Pro
            </label>
          </RadioGroup>
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Switch', () => {
    it('has no violations with a label', async () => {
      const { container } = render(
        <div>
          <label htmlFor="notify">Notifications</label>
          <Switch id="notify" defaultChecked />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Slider', () => {
    it('has no violations with an aria-label', async () => {
      const { container } = render(<Slider aria-label="Volume" defaultValue={30} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations inside a Field', async () => {
      const { container } = render(
        <Field label="Volume">
          <Slider defaultValue={30} />
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  // Overlays portal to <body> on purpose, which puts them outside any
  // landmark — axe's `region` rule then flags the whole document. That is a
  // property of the PAGE (a real app wraps its content in landmarks), not of
  // the component, and no portalling component can satisfy it. Every other
  // rule stays on.
  const PORTAL_AXE_OPTIONS = { rules: { region: { enabled: false } } };

  describe('Spinner', () => {
    it('has no violations when labelled', async () => {
      const { container } = render(<Spinner label="Loading" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations as decoration', async () => {
      const { container } = render(<Spinner />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Progress', () => {
    it('has no violations when determinate', async () => {
      const { container } = render(<Progress aria-label="Upload" value={40} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations when indeterminate', async () => {
      const { container } = render(<Progress aria-label="Working" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Skeleton', () => {
    it('has no violations', async () => {
      const { container } = render(
        <div>
          <Skeleton lines={3} />
          <Skeleton variant="circle" width="3rem" />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Tooltip', () => {
    it('has no violations while open', async () => {
      const { container } = render(
        <Tooltip content="Saves your work" open>
          <Button>Save</Button>
        </Tooltip>,
      );
      expect(await axe(container.ownerDocument.body, PORTAL_AXE_OPTIONS)).toHaveNoViolations();
    });
  });

  describe('Popover', () => {
    it('has no violations while open', async () => {
      const { container } = render(
        <Popover label="Filters" open content={<Button>Apply</Button>}>
          <Button>Open</Button>
        </Popover>,
      );
      expect(await axe(container.ownerDocument.body, PORTAL_AXE_OPTIONS)).toHaveNoViolations();
    });
  });

  describe('Menu', () => {
    it('has no violations while open', async () => {
      const { container } = render(
        <Menu
          label="Actions"
          open
          items={[
            { value: 'a', label: 'Edit' },
            { value: 'b', label: 'Delete', disabled: true },
          ]}
        >
          <Button>Open</Button>
        </Menu>,
      );
      expect(await axe(container.ownerDocument.body, PORTAL_AXE_OPTIONS)).toHaveNoViolations();
    });
  });

  describe('Drawer', () => {
    it('has no violations while open', async () => {
      const { container } = render(
        <Drawer open onClose={() => {}} title="Settings" closeLabel="Dismiss">
          <Button>Inside</Button>
        </Drawer>,
      );
      expect(await axe(container.ownerDocument.body, PORTAL_AXE_OPTIONS)).toHaveNoViolations();
    });
  });

  describe('ToastProvider', () => {
    it('has no violations with both live regions mounted', async () => {
      const { container } = render(
        <ToastProvider>
          <Button>App</Button>
        </ToastProvider>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Tabs', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Tabs
          label="Settings"
          items={[
            { value: 'a', label: 'Account', content: 'Account panel' },
            { value: 'b', label: 'Billing', content: 'Billing panel', disabled: true },
          ]}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Link', () => {
    it('has no violations', async () => {
      const { container } = render(
        <div>
          <Link href="/pricing">Pricing</Link>{' '}
          <Link href="https://example.test" external newTabLabel="opens in a new tab">
            Docs
          </Link>
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Pagination', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Pagination
          count={20}
          defaultPage={10}
          label="Pagination"
          previousLabel="Previous page"
          nextLabel="Next page"
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Accordion', () => {
    it('has no violations', async () => {
      const { container } = render(
        <Accordion
          defaultValue="a"
          items={[
            { value: 'a', label: 'Shipping', content: 'Ships in 3 days.' },
            { value: 'b', label: 'Returns', content: 'Within 30 days.' },
          ]}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Avatar', () => {
    it('has no violations named or decorative', async () => {
      const { container } = render(
        <div>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" src="/grace.png" />
          <Avatar>?</Avatar>
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Chip', () => {
    it('has no violations across its modes', async () => {
      const { container } = render(
        <div>
          <Chip>Static</Chip>
          <Chip onClick={() => {}} selected>
            Filter
          </Chip>
          <Chip onRemove={() => {}} removeLabel="Remove React">
            React
          </Chip>
          <Chip onClick={() => {}} onRemove={() => {}} removeLabel="Remove Vue">
            Vue
          </Chip>
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Table', () => {
    it('has no violations, sorted and empty', async () => {
      const { container } = render(
        <div>
          <Table
            label="Invoices"
            columns={[
              { key: 'name', header: 'Name', sortable: true },
              { key: 'amount', header: 'Amount', align: 'end' },
            ]}
            data={[{ name: 'Ada', amount: 120 }]}
            getRowKey={(row) => String((row as { name: string }).name)}
            sort={{ key: 'name', direction: 'ascending' }}
          />
          <Table
            label="Empty"
            columns={[{ key: 'name', header: 'Name' }]}
            data={[]}
            getRowKey={() => 'x'}
            emptyState="Nothing here"
          />
        </div>,
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
