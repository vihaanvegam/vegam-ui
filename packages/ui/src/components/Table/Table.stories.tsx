import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Badge } from '../Badge';
import { Chip } from '../Chip';
import { Table } from './Table';
import type { TableColumn, TableSort } from './Table.types';

interface Invoice {
  id: string;
  customer: string;
  status: 'paid' | 'due' | 'failed';
  amount: number;
}

const rows: Invoice[] = [
  { id: 'INV-001', customer: 'Ada Lovelace', status: 'paid', amount: 1200 },
  { id: 'INV-002', customer: 'Grace Hopper', status: 'due', amount: 480 },
  { id: 'INV-003', customer: 'Alan Turing', status: 'failed', amount: 95 },
];

const columns: TableColumn<Invoice>[] = [
  { key: 'id', header: 'Invoice', sortable: true, width: '8rem' },
  { key: 'customer', header: 'Customer', sortable: true },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <Chip
        size="sm"
        tone={row.status === 'paid' ? 'success' : row.status === 'due' ? 'warning' : 'danger'}
      >
        {row.status}
      </Chip>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'end',
    sortable: true,
    cell: (row) => `$${row.amount.toLocaleString()}`,
  },
];

const meta: Meta<typeof Table<Invoice>> = {
  title: 'Components/Table',
  component: Table,
  args: { columns, data: rows, getRowKey: (row: Invoice) => row.id, label: 'Invoices' },
  argTypes: {
    columns: { control: false },
    data: { control: false },
    getRowKey: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    emptyState: { control: false },
    stickyHeader: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Table<Invoice>>;

export const Basic: Story = {};

/**
 * Table only REPORTS sort intent — the consumer owns the data, so it does
 * the sorting. This story shows the wiring.
 */
export const Sortable: Story = {
  render: function Sortable() {
    const [sort, setSort] = useState<TableSort>({ key: 'amount', direction: 'descending' });
    const sorted = [...rows].sort((a, b) => {
      const key = sort.key as keyof Invoice;
      const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
      return sort.direction === 'ascending' ? order : -order;
    });
    return (
      <Table<Invoice>
        columns={columns}
        data={sorted}
        getRowKey={(row) => row.id}
        label="Invoices"
        sort={sort}
        onSortChange={setSort}
      />
    );
  },
};

export const EmptyState: Story = {
  args: { data: [], emptyState: 'No invoices yet.' },
};

export const StickyHeader: Story = {
  render: () => (
    <div style={{ maxBlockSize: '12rem', overflowY: 'auto' }}>
      <Table<Invoice>
        columns={columns}
        data={[...rows, ...rows, ...rows].map((row, index) => ({
          ...row,
          id: `${row.id}-${index}`,
        }))}
        getRowKey={(row) => row.id}
        label="Invoices"
        stickyHeader
      />
    </div>
  ),
};

/** `slots.cell` for custom rendering that the column API does not cover. */
export const CellSlot: Story = {
  args: {
    slots: {
      cell: ({ className, children, column }) => (
        <td className={className} data-column={column.key}>
          {column.key === 'customer' ? <Badge tone="info">{children}</Badge> : children}
        </td>
      ),
    },
  },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Table<Invoice>
          columns={columns}
          data={rows}
          getRowKey={(row) => row.id}
          label="Invoices"
        />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
