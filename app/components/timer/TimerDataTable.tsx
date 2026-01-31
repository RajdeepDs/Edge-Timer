import { Button } from "@shopify/polaris";
import { StatusBadge } from "../ui/StatusBadge";
import type { Timer } from "../../types/timer";

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
      <s-table>
        <s-table-header-row>
          <s-table-header listSlot="primary">Timer</s-table-header>
          <s-table-header listSlot="inline">Type</s-table-header>
          <s-table-header listSlot="labeled">Status</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {timers.map((timer) => (
            <s-table-row key={timer.id}>
              <s-table-cell>
                <Button
                  variant="plain"
                  onClick={() => onTimerClick?.(timer.id)}
                  textAlign="left"
                >
                  {timer.name}
                </Button>
              </s-table-cell>
              <s-table-cell>{timer.type}</s-table-cell>
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
