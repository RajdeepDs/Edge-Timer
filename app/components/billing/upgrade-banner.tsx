import { Banner } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

interface UpgradeBannerProps {
  title: string;
  message?: string;
  recommendedPlan?: string;
  onDismiss?: () => void;
  showCTA?: boolean;
}

export default function UpgradeBanner({
  title,
  message,
  recommendedPlan,
  onDismiss,
  showCTA = true,
}: UpgradeBannerProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/plans");
  };

  return (
    <Banner
      title={title}
      tone="warning"
      onDismiss={onDismiss}
      action={
        showCTA
          ? {
              content: recommendedPlan
                ? `Upgrade to ${recommendedPlan}`
                : "View Plans",
              onAction: handleUpgrade,
            }
          : undefined
      }
    >
      {message && <p>{message}</p>}
    </Banner>
  );
}
