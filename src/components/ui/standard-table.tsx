import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StandardTableProps {
  children: React.ReactNode;
  className?: string;
}

interface StandardTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface StandardTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface StandardTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

interface StandardTableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

interface StandardTableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

// Standard Table Container
export const StandardTable = React.forwardRef<HTMLDivElement, StandardTableProps>(
  ({ children, className, ...props }, ref) => (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="relative w-full overflow-auto">
        <Table className={cn("w-full caption-bottom text-sm", className)} {...props}>
          {children}
        </Table>
      </div>
    </div>
  )
);
StandardTable.displayName = "StandardTable";

// Standard Table Header
export const StandardTableHeader = React.forwardRef<HTMLTableSectionElement, StandardTableHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <TableHeader ref={ref} className={cn("bg-muted/50 border-b [&_tr]:border-b", className)} {...props}>
      {children}
    </TableHeader>
  )
);
StandardTableHeader.displayName = "StandardTableHeader";

// Standard Table Body
export const StandardTableBody = React.forwardRef<HTMLTableSectionElement, StandardTableBodyProps>(
  ({ children, className, ...props }, ref) => (
    <TableBody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </TableBody>
  )
);
StandardTableBody.displayName = "StandardTableBody";

// Standard Table Row
export const StandardTableRow = React.forwardRef<HTMLTableRowElement, StandardTableRowProps>(
  ({ children, className, onClick, isClickable = false, ...props }, ref) => (
    <TableRow
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        isClickable && "cursor-pointer hover:bg-muted/70",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </TableRow>
  )
);
StandardTableRow.displayName = "StandardTableRow";

// Standard Table Cell
export const StandardTableCell = React.forwardRef<HTMLTableCellElement, StandardTableCellProps>(
  ({ children, className, colSpan, ...props }, ref) => (
    <TableCell
      ref={ref}
      className={cn("px-4 py-3 text-sm", className)}
      colSpan={colSpan}
      {...props}
    >
      {children}
    </TableCell>
  )
);
StandardTableCell.displayName = "StandardTableCell";

// Standard Table Head
export const StandardTableHead = React.forwardRef<HTMLTableCellElement, StandardTableHeadProps>(
  ({ children, className, align = 'left', ...props }, ref) => {
    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }[align];

    return (
      <TableHead
        ref={ref}
        className={cn(
          "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
          alignClass,
          className
        )}
        {...props}
      >
        {children}
      </TableHead>
    );
  }
);
StandardTableHead.displayName = "StandardTableHead";

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colSpan: number;
}

export const TableEmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, colSpan }) => (
  <StandardTableRow>
    <StandardTableCell colSpan={colSpan} className="text-center py-12">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
      </div>
    </StandardTableCell>
  </StandardTableRow>
);

// Loading State Component
interface LoadingStateProps {
  colSpan: number;
  rows?: number;
}

export const TableLoadingState: React.FC<LoadingStateProps> = ({ colSpan, rows = 3 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <StandardTableRow key={index}>
        {Array.from({ length: colSpan }).map((_, cellIndex) => (
          <StandardTableCell key={cellIndex}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </StandardTableCell>
        ))}
      </StandardTableRow>
    ))}
  </>
);
