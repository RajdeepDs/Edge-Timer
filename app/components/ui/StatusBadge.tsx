import { Badge } from "@shopify/polaris";

interface StatusBadgeProps {
  isPublished: boolean;
}

export function StatusBadge({ isPublished }: StatusBadgeProps) {
  if (isPublished) {
    return <Badge tone="success">Published</Badge>;
  }

  return <Badge>Not published</Badge>;
}
