import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Table, tableClasses } from './Table';
import type { TableColumn } from './Table.types';

interface Row {
  id: string;
  name: string;
  amount: number;
}

const data: Row[] = [
  { id: '1', name: 'Ada', amount: 120 },
  { id: '2', name: 'Grace', amount: 80 },
];

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'amount', header: 'Amount', align: 'end', cell: (row) => `$${row.amount}` },
];

const setup = (props: Partial<React.ComponentProps<typeof Table<Row>>> = {}) =>
  render(
    <Table<Row>
      columns={columns}
      data={data}
      getRowKey={(row) => row.id}
      label="Invoices"
      {...props}
    />,
  );

describe('Table', () => {
  it('renders semantic table markup named by label', () => {
    setup();
    const table = screen.getByRole('table', { name: 'Invoices' });
    expect(table.tagName).toBe('TABLE');
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 rows
  });

  it('column headers carry scope="col"', () => {
    setup();
    screen.getAllByRole('columnheader').forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col');
    });
  });

  it('reads row[key] by default and uses cell() when given', () => {
    setup();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('$120')).toBeInTheDocument();
  });

  it('a sortable column is announced as sortable but unsorted', () => {
    setup();
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'none');
    // A non-sortable column has no aria-sort at all.
    expect(screen.getByRole('columnheader', { name: 'Amount' })).not.toHaveAttribute('aria-sort');
  });

  it('reflects the active sort as aria-sort', () => {
    setup({ sort: { key: 'name', direction: 'ascending' } });
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });

  it('sorting is a real button and only REPORTS intent — it never reorders data', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    setup({ onSortChange });
    await user.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' });
    // Row order is untouched: sorting the data is the consumer's job.
    const cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Ada');
  });

  it('toggles ascending -> descending on the sorted column', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    setup({ sort: { key: 'name', direction: 'ascending' }, onSortChange });
    await user.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'descending' });
  });

  it('renders the empty state instead of rows', () => {
    setup({ data: [], emptyState: 'No invoices yet' });
    expect(screen.getByText('No invoices yet')).toBeInTheDocument();
    expect(screen.queryByText('Ada')).toBeNull();
  });

  it('the scroll container is keyboard reachable and named', () => {
    const { container } = setup();
    const wrapper = container.querySelector(`.${tableClasses.wrapper}`) as HTMLElement;
    expect(wrapper).toHaveAttribute('tabindex', '0');
    expect(wrapper).toHaveAccessibleName('Invoices');
  });

  it('applies the sticky header class only when asked', () => {
    const { container, rerender } = setup();
    expect(container.querySelector(`.${tableClasses.root}`)).not.toHaveClass(tableClasses.sticky);
    rerender(
      <Table<Row>
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
        label="Invoices"
        stickyHeader
      />,
    );
    expect(container.querySelector(`.${tableClasses.root}`)).toHaveClass(tableClasses.sticky);
  });

  it('slots replace header and body cells', () => {
    setup({
      slots: {
        headerCell: ({ className, children }) => (
          <th scope="col" data-custom-header="true" className={className}>
            {children}
          </th>
        ),
        cell: ({ className, children }) => (
          <td data-custom-cell="true" className={className}>
            {children}
          </td>
        ),
      },
    });
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('data-custom-header', 'true');
    expect(screen.getAllByRole('cell')[0]).toHaveAttribute('data-custom-cell', 'true');
  });

  it('applies alignment classes', () => {
    const { container } = setup();
    expect(container.querySelector('.ui-table__td--end')).toBeInTheDocument();
  });

  it('merges className on the wrapper', () => {
    const { container } = setup({ className: 'custom' });
    expect(container.querySelector(`.${tableClasses.wrapper}`)).toHaveClass('custom');
  });

  it('forwards the ref to the scroll container and keeps Row inferable', () => {
    let node: HTMLDivElement | null = null;
    const { container } = render(
      <Table<Row>
        ref={(el) => {
          node = el;
        }}
        columns={[
          // If the generic collapsed to unknown through forwardRef, `row.name`
          // below would not type-check — this test is the compile-time guard.
          { key: 'name', header: 'Name', cell: (row) => row.name.toUpperCase() },
        ]}
        data={data}
        getRowKey={(row) => row.id}
        label="Invoices"
      />,
    );
    expect(node).toBe(container.querySelector(`.${tableClasses.wrapper}`));
    expect(screen.getByText('ADA')).toBeInTheDocument();
  });

  it('spreads rest props on the root', () => {
    setup({ 'data-testid': 'tbl' } as Record<string, unknown>);
    expect(screen.getByTestId('tbl')).toHaveClass(tableClasses.wrapper);
  });
});
