'use client';

import { forwardRef } from 'react';
import type { ForwardedRef, ReactElement, Ref } from 'react';
import { cx } from '../../utils/cx';
import type { TableAlign, TableColumn, TableProps } from './Table.types';
import './Table.css';

/** Classes rendered by {@link Table} — the documented override surface. */
export const tableClasses = {
  wrapper: 'ui-table-wrapper',
  root: 'ui-table',
  sticky: 'ui-table--sticky',
  th: 'ui-table__th',
  td: 'ui-table__td',
  sort: 'ui-table__sort',
  sortIndicator: 'ui-table__sort-indicator',
  empty: 'ui-table__empty',
} as const;

const alignClass = (align: TableAlign | undefined, base: 'th' | 'td') =>
  align && align !== 'start' ? `ui-table__${base}--${align}` : undefined;

/**
 * The implementation. Exported through the generic-preserving `Table` cast
 * below — `forwardRef` erases type parameters, so a plain
 * `forwardRef(TableImpl)` would collapse `Row` to `unknown` and every
 * `cell` callback would lose its typing.
 *
 * A semantic data table: `columns` + `data` + `getRowKey`, rendering real
 * `table`/`thead`/`tbody`/`th` markup. Custom rendering goes through
 * `slots.headerCell` / `slots.cell` (the locked composite pattern — not
 * compound children).
 *
 * **The library performs no data operations.** Sortable columns emit
 * `onSortChange` and reflect `sort` as `aria-sort`; sorting, filtering, and
 * paginating the rows stay the consumer's job (§8.5). Selection, expansion,
 * virtualization, and editing are a DataGrid — deliberately Tier-Later.
 *
 * Accessibility: `th` cells carry `scope="col"`, so every data cell is
 * associated with its column header. The table is named by `label` (or
 * `aria-labelledby`). A sortable header wraps a real `<button>` — activating
 * a sort must be a control, not a click handler on a `th` — and the header
 * carries `aria-sort`, which is what tells assistive tech the current order.
 * The scroll container is `tabIndex={0}` and `role="group"` so keyboard
 * users can scroll a wide table (WCAG 2.1.1); it is named by the same label
 * so that stop is not anonymous.
 *
 * Generic over the row type, so `cell` callbacks receive a typed row.
 */
function TableImpl<Row>(props: TableProps<Row>, ref: ForwardedRef<HTMLDivElement>) {
  const {
    columns,
    data,
    getRowKey,
    label,
    sort,
    onSortChange,
    emptyState,
    stickyHeader = false,
    slots,
    slotProps,
    className,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const { className: tableClassName, ...tableRest } = slotProps?.table ?? {};
  const { className: headClassName, ...headRest } = slotProps?.head ?? {};
  const { className: bodyClassName, ...bodyRest } = slotProps?.body ?? {};
  const { className: rowClassName, ...rowRest } = slotProps?.row ?? {};

  const HeaderCellSlot = slots?.headerCell;
  const CellSlot = slots?.cell;

  const requestSort = (column: TableColumn<Row>) => {
    if (!column.sortable) return;
    const isSorted = sort?.key === column.key;
    onSortChange?.({
      key: column.key,
      direction: isSorted && sort?.direction === 'ascending' ? 'descending' : 'ascending',
    });
  };

  return (
    <div
      ref={ref}
      className={cx(tableClasses.wrapper, className)}
      // Scrollable regions must be keyboard reachable (WCAG 2.1.1).
      tabIndex={0}
      role="group"
      aria-label={ariaLabelledBy ? undefined : label}
      aria-labelledby={ariaLabelledBy}
      {...rest}
    >
      <table
        className={cx(tableClasses.root, stickyHeader && tableClasses.sticky, tableClassName)}
        aria-label={ariaLabelledBy ? undefined : label}
        aria-labelledby={ariaLabelledBy}
        {...tableRest}
      >
        <thead className={headClassName} {...headRest}>
          <tr>
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;
              const direction = isSorted ? sort?.direction : undefined;
              const thClassName = cx(tableClasses.th, alignClass(column.align, 'th'));
              const content = column.sortable ? (
                <button
                  type="button"
                  onClick={() => requestSort(column)}
                  className={tableClasses.sort}
                >
                  {column.header}
                  <span aria-hidden="true" className={tableClasses.sortIndicator} />
                </button>
              ) : (
                column.header
              );

              if (HeaderCellSlot) {
                return (
                  <HeaderCellSlot
                    key={column.key}
                    column={column}
                    sort={direction}
                    className={thClassName}
                  >
                    {content}
                  </HeaderCellSlot>
                );
              }
              return (
                <th
                  key={column.key}
                  scope="col"
                  // `none` (not omitted) on the other sortable columns tells
                  // AT they are sortable but currently unsorted.
                  aria-sort={column.sortable ? (direction ?? 'none') : undefined}
                  style={column.width ? { width: column.width } : undefined}
                  className={thClassName}
                >
                  {content}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={bodyClassName} {...bodyRest}>
          {data.length === 0 && emptyState ? (
            <tr>
              <td colSpan={columns.length} className={tableClasses.empty}>
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)} className={rowClassName} {...rowRest}>
                {columns.map((column) => {
                  const tdClassName = cx(tableClasses.td, alignClass(column.align, 'td'));
                  const content = column.cell
                    ? column.cell(row, rowIndex)
                    : ((row as Record<string, unknown>)[column.key] as React.ReactNode);
                  if (CellSlot) {
                    return (
                      <CellSlot
                        key={column.key}
                        column={column}
                        row={row}
                        rowIndex={rowIndex}
                        className={tdClassName}
                      >
                        {content}
                      </CellSlot>
                    );
                  }
                  return (
                    <td key={column.key} className={tdClassName}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

TableImpl.displayName = 'Table';

/**
 * A semantic data table. See {@link TableImpl} for the full contract.
 *
 * The cast is what keeps `Row` inferable through `forwardRef`: React types
 * the wrapper as a non-generic component, so without it every consumer would
 * get `unknown` rows in their `cell` callbacks. The ref goes to the scroll
 * container (the root element), matching every other component.
 */
export const Table = forwardRef(TableImpl) as <Row>(
  props: TableProps<Row> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
