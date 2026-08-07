import type { ComponentType, HTMLAttributes, ReactNode, TableHTMLAttributes } from 'react';

/** Which way a column is currently sorted. */
export type SortDirection = 'ascending' | 'descending';

/** The active sort, reported by `onSortChange`. */
export interface TableSort {
  /** The sorted column's `key`. */
  key: string;
  direction: SortDirection;
}

/** Horizontal alignment of a column's cells. */
export type TableAlign = 'start' | 'center' | 'end';

/** One column definition. */
export interface TableColumn<Row> {
  /** Stable identity, used for sorting and as the React key. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /**
   * Cell content for a row. Omit to render `row[key]` when the row is a
   * plain record — supply it for anything else.
   */
  cell?: (row: Row, index: number) => ReactNode;
  /** Cell alignment. Numeric columns usually want `end`. @default 'start' */
  align?: TableAlign;
  /**
   * Marks the column sortable. **The consumer sorts the data** — Table only
   * reports intent via `onSortChange` and reflects it as `aria-sort` (§8.5).
   */
  sortable?: boolean;
  /** Any CSS length, applied as the column's width. */
  width?: string;
}

/** What {@link TableSlots.headerCell} receives. */
export interface TableHeaderCellRenderProps<Row> {
  column: TableColumn<Row>;
  /** The column's current sort, or undefined when it is not the sorted one. */
  sort?: SortDirection;
  className: string;
  children: ReactNode;
}

/** What {@link TableSlots.cell} receives. */
export interface TableCellRenderProps<Row> {
  column: TableColumn<Row>;
  row: Row;
  rowIndex: number;
  className: string;
  children: ReactNode;
}

/** Replaceable parts of {@link Table} — the locked composite pattern. */
export interface TableSlots<Row> {
  headerCell?: ComponentType<TableHeaderCellRenderProps<Row>>;
  cell?: ComponentType<TableCellRenderProps<Row>>;
}

/** Per-part props for {@link Table}. */
export interface TableSlotProps {
  table?: TableHTMLAttributes<HTMLTableElement>;
  head?: HTMLAttributes<HTMLTableSectionElement>;
  body?: HTMLAttributes<HTMLTableSectionElement>;
  row?: HTMLAttributes<HTMLTableRowElement>;
}

/** Props for {@link Table}. */
export interface TableProps<Row> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Column definitions in display order. */
  columns: TableColumn<Row>[];
  /** Rows, already sorted/filtered/paginated by the consumer. */
  data: Row[];
  /** Stable React key for a row. */
  getRowKey: (row: Row, index: number) => string;
  /**
   * Accessible name for the table. Required unless `aria-labelledby` points
   * at a visible heading.
   */
  label?: string;
  /** The active sort, reflected as `aria-sort`. */
  sort?: TableSort;
  /**
   * Fired when a sortable header is activated, with the sort the user is
   * asking for. **Sorting the data is the consumer's job** — ui performs no
   * data operations.
   */
  onSortChange?: (sort: TableSort) => void;
  /** Shown in place of rows when `data` is empty. */
  emptyState?: ReactNode;
  /** Keeps the header visible while the table body scrolls. @default false */
  stickyHeader?: boolean;
  /** Replaceable parts. */
  slots?: TableSlots<Row>;
  /** Per-part props. */
  slotProps?: TableSlotProps;
}
