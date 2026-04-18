import { StatusBadge } from "../ui/StatusBadge";
import type { Timer } from "../../types/timer";

function formatTimerType(type: string): string {
  const typeMap: Record<string, string> = {
    "top-bottom-bar": "Top/Bottom Bar",
    "product-page": "Product page",
    "landing-page": "Landing page",
    "cart-page": "Cart page",
  };
  return typeMap[type] || type;
}

const tableRowStyles = `
  s-table-row[clickDelegate] {
    cursor: pointer;
  }

  s-table-row[clickDelegate]:hover {
    background-color: var(--s-color-surface-secondary, #f5f5f5);
  }

  s-table-row s-link {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

interface TimerDataTableProps {
  timers: Timer[];
  onTimerClick?: (timerId: string) => void;
  onDelete?: (timerId: string) => void;
  onTogglePublish?: (timerId: string) => void;
}

export function TimerDataTable({
  timers,
  onTimerClick,
  onDelete,
  onTogglePublish,
}: TimerDataTableProps) {
  return (
    <s-section padding="none">
      <style>{tableRowStyles}</style>
      <s-table>
        <s-table-header-row>
          <s-table-header listSlot="primary">Timer name</s-table-header>
          <s-table-header listSlot="inline">Type</s-table-header>
          <s-table-header listSlot="inline">Date</s-table-header>
          <s-table-header listSlot="labeled" format="numeric">
            Status
          </s-table-header>
        </s-table-header-row>
        <s-table-body>
          {timers.map((timer) => (
            <s-table-row
              key={timer.id}
              clickDelegate={`timer-link-${timer.id}`}
            >
              <s-table-cell>
                {timer.name}
                <s-link
                  id={`timer-link-${timer.id}`}
                  href={`/timers/${timer.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onTimerClick?.(timer.id);
                  }}
                  aria-label={timer.name}
                />
              </s-table-cell>
              <s-table-cell>{formatTimerType(timer.type)}</s-table-cell>
              <s-table-cell>
                {timer.startsAt && timer.endDate
                  ? `${new Date(timer.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(timer.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : timer.endDate
                    ? new Date(timer.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
              </s-table-cell>
              <s-table-cell>
                <StatusBadge isPublished={timer.isPublished} />
              </s-table-cell>
            </s-table-row>
          ))}
        </s-table-body>
      </s-table>
    </s-section>
  );
}
