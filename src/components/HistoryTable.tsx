import type { ReactNode } from "react";

interface HistoryColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface HistoryTableProps<T extends { id: string }> {
  columns: HistoryColumn<T>[];
  rows: T[];
  emptyMessage: string;
}

export default function HistoryTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage,
}: HistoryTableProps<T>) {
  return (
    <div className="table-container overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-glass-border">
            {columns.map((col) => (
              <th key={col.key} className="table-header">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-glass-border/50 hover:bg-glass-50"
            >
              {columns.map((col) => (
                <td key={col.key} className={`table-cell ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
}
