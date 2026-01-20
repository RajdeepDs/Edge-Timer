import { useSearchParams } from "@remix-run/react";
import { Page, Badge, Box, Tabs, Card, InlineGrid } from "@shopify/polaris";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useCallback, useState } from "react";
import ContentTab from "../components/timer/ContentTab";
import DesignTab from "../components/timer/DesignTab";
import PlacementTab from "../components/timer/PlacementTab";
import TimerPreview from "../components/timer/TimerPreview";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function TimerConfigPage() {
  const [searchParams] = useSearchParams();
  const timerTypeParam = searchParams.get("type");
  const timerType: "product" | "top-bottom-bar" =
    timerTypeParam === "top-bottom-bar" ? "top-bottom-bar" : "product";

  const [selected, setSelected] = useState(0);
  const [timerName, setTimerName] = useState("");
  const [title, setTitle] = useState("Hurry up!");
  const [subheading, setSubheading] = useState("Sale ends in:");

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: "content-1",
      content: "Content",
      accessibilityLabel: "Contents",
      panelID: "content-1",
    },
    {
      id: "design-1",
      content: "Design",
      accessibilityLabel: "Design",
      panelID: "design-1",
    },
    {
      id: "placement-1",
      content: "Placement",
      accessibilityLabel: "Placement",
      panelID: "placement-1",
    },
  ];

  const renderTabContent = () => {
    switch (selected) {
      case 0:
        return (
          <ContentTab
            timerType={timerType}
            timerName={timerName}
            setTimerName={setTimerName}
            title={title}
            setTitle={setTitle}
            subheading={subheading}
            setSubheading={setSubheading}
            onContinue={() => handleTabChange(1)}
          />
        );
      case 1:
        return (
          <DesignTab
            timerType={timerType}
            onContinue={() => handleTabChange(2)}
          />
        );
      case 2:
        return <PlacementTab timerType={timerType} />;
      default:
        return null;
    }
  };

  return (
    <Page
      title="Timer name"
      backAction={{
        content: "Back",
        url: "/new",
      }}
      titleMetadata={<Badge>Not published</Badge>}
      subtitle="Timer ID: Save or Publish to show timer ID"
      primaryAction={{ content: "Publish" }}
    >
      <Box paddingBlockEnd="800">
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Box paddingBlockStart="400">
            <InlineGrid columns={{ xs: 1, lg: "2fr 3fr" }} gap="3200">
              <Box>
                <Card padding="400">{renderTabContent()}</Card>
              </Box>
              <Box>
                <TimerPreview title={title} subheading={subheading} />
              </Box>
            </InlineGrid>
          </Box>
        </Tabs>
      </Box>
    </Page>
  );
}
