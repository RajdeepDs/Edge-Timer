import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState, useCallback } from "react";
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Box,
  Button,
  Icon,
  Divider,
  Collapsible,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import {
  BugIcon,
  LightbulbIcon,
  QuestionCircleIcon,
  EmailIcon,
  ChatIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

const SUPPORT_EMAIL = "support@edgecoms.com";

const contactOptions = [
  {
    id: "bug",
    icon: BugIcon,
    title: "Report a Bug",
    description:
      "Something not working as expected? Send us details and we'll investigate right away.",
    subject: "Bug Report – Edge Timer",
    body: "Hi Edge Timer Team,\n\nI'd like to report a bug:\n\n[Describe the issue]\n\nSteps to reproduce:\n1. \n2. \n\nExpected behavior:\n\nActual behavior:\n\nShop URL: ",
    buttonLabel: "Report Bug",
    badgeLabel: "Bug",
    badgeTone: "critical" as const,
  },
  {
    id: "feature",
    icon: LightbulbIcon,
    title: "Feature Request",
    description:
      "Have an idea to make Edge Timer better? We'd love to hear your suggestions.",
    subject: "Feature Request – Edge Timer",
    body: "Hi Edge Timer Team,\n\nI have a feature request:\n\n[Describe the feature you'd like]\n\nWhy it would be useful:\n\nShop URL: ",
    buttonLabel: "Request Feature",
    badgeLabel: "Feature",
    badgeTone: "info" as const,
  },
  {
    id: "help",
    icon: ChatIcon,
    title: "General Help",
    description:
      "Have a question about setup, configuration, or anything else? We're happy to help.",
    subject: "Help Request – Edge Timer",
    body: "Hi Edge Timer Team,\n\nI need help with:\n\n[Describe what you need help with]\n\nShop URL: ",
    buttonLabel: "Get Help",
    badgeLabel: "Help",
    badgeTone: "success" as const,
  },
];

const faqs = [
  {
    question: "How do I create my first countdown timer?",
    answer:
      'Go to the Home page and click "New Timer". Choose between a Product Page timer (shown inline on product pages) or a Top/Bottom Bar timer (shown as a banner across your store). Then configure the content, design, and placement settings.',
  },
  {
    question: "What is the difference between Countdown and Fixed Minutes?",
    answer:
      "Countdown timers count down to a specific end date and time — every visitor sees the same deadline. Fixed Minutes timers give each visitor their own personal countdown (e.g. 15 minutes) that starts when they first land on the page, stored per-session in their browser.",
  },
  {
    question: "Why is my timer not showing on the storefront?",
    answer:
      "Make sure the timer is Published (toggle the publish button on the timer page). Also verify the Placement settings — check that the timer is set to show on the right products, pages, or collections. For bar timers, confirm the app embed is enabled in your theme editor.",
  },
  {
    question: "Can I show the timer only to visitors from specific countries?",
    answer:
      'Yes. In the Placement tab of your timer, scroll to the Geolocation section and switch from "All countries" to "Specific countries", then pick the countries you want to target.',
  },
  {
    question: "What happens when a timer reaches zero?",
    answer:
      "You can choose the expiry behavior in the Content tab: Unpublish (hides and unpublishes the timer), Hide (removes it from the storefront), Keep Visible (freezes at 00:00:00), or Repeat (restarts — only available for Fixed Minutes timers).",
  },
  {
    question: "Can I customize the timer colors and fonts?",
    answer:
      "Yes. The Design tab gives you full control over background, text colors, font sizes, font weights, border, spacing, and button styles. Changes are previewed live on the right side of the editor.",
  },
  {
    question: "Can I assign a timer to specific products or collections?",
    answer:
      "Yes. In the Placement tab, use the Product Selection section to target all products, specific products by ID, specific collections, or products with certain tags. You can also exclude specific products.",
  },
  {
    question: "Is there a limit on how many timers I can create?",
    answer:
      "The number of active timers and monthly views depends on your plan. Check the Pricing Plans page to see the limits for your current plan and upgrade if needed.",
  },
  {
    question: "How do I hide the Days, Hours, Mins, Secs labels?",
    answer:
      'In the Content tab, find the "Timer labels" toggle and switch it off. The countdown numbers will still display but without the unit labels underneath.',
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = useCallback((id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  }, []);

  const buildGmailUrl = (subject: string, body: string) =>
    `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(SUPPORT_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Page
      title="Help & Support"
      subtitle="Get help, report issues, or request new features — we respond within 24 hours."
    >
      <BlockStack gap="800">
        {/* ── Contact Section ── */}
        <BlockStack gap="400">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--p-space-200)",
            }}
          >
            <span style={{ display: "flex", flexShrink: 0 }}>
              <Icon source={EmailIcon} tone="base" />
            </span>
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Contact Us
            </Text>
          </div>
          <Text as="p" variant="bodySm" tone="subdued">
            Choose the type of request below and we'll open a pre-filled email
            for you. Reach us at{" "}
            <Text as="span" variant="bodySm" fontWeight="semibold">
              {SUPPORT_EMAIL}
            </Text>
          </Text>

          <InlineGrid columns={{ xs: 1, sm: 1, md: 3 }} gap="400">
            {contactOptions.map((opt) => (
              <Card key={opt.id}>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="start">
                    <Box
                      background="bg-surface-secondary"
                      padding="200"
                      borderRadius="200"
                    >
                      <Icon source={opt.icon} tone="base" />
                    </Box>
                    <Badge tone={opt.badgeTone}>{opt.badgeLabel}</Badge>
                  </InlineStack>

                  <BlockStack gap="150">
                    <Text as="h3" variant="headingSm" fontWeight="semibold">
                      {opt.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {opt.description}
                    </Text>
                  </BlockStack>

                  <Box>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() =>
                        window.open(
                          buildGmailUrl(opt.subject, opt.body),
                          "_blank",
                        )
                      }
                    >
                      {opt.buttonLabel}
                    </Button>
                  </Box>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>
        </BlockStack>

        <Divider />

        {/* ── FAQ Section ── */}
        <BlockStack gap="400">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--p-space-200)",
            }}
          >
            <span style={{ display: "flex", flexShrink: 0 }}>
              <Icon source={QuestionCircleIcon} tone="base" />
            </span>
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Frequently Asked Questions
            </Text>
          </div>
          <Text as="p" variant="bodySm" tone="subdued">
            Quick answers to the most common questions about Edge Timer.
          </Text>

          <Card padding="0">
            <BlockStack gap="0">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === faq.question;
                const isLast = index === faqs.length - 1;
                return (
                  <Box key={faq.question}>
                    <button
                      style={{
                        all: "unset",
                        display: "block",
                        width: "100%",
                        cursor: "pointer",
                        padding: "var(--p-space-400)",
                        boxSizing: "border-box",
                      }}
                      onClick={() => toggleFaq(faq.question)}
                      aria-expanded={isOpen}
                    >
                      <InlineStack
                        align="space-between"
                        blockAlign="center"
                        wrap={false}
                      >
                        <Text
                          as="span"
                          variant="bodyMd"
                          fontWeight={isOpen ? "semibold" : "regular"}
                        >
                          {faq.question}
                        </Text>
                        <Text as="span" variant="bodyLg" tone="subdued">
                          {isOpen ? "−" : "+"}
                        </Text>
                      </InlineStack>
                    </button>

                    <Collapsible
                      open={isOpen}
                      id={`faq-${index}`}
                      transition={{
                        duration: "150ms",
                        timingFunction: "ease-in-out",
                      }}
                    >
                      <Box
                        paddingInlineStart="400"
                        paddingInlineEnd="400"
                        paddingBlockEnd="400"
                      >
                        <Text as="p" variant="bodySm" tone="subdued">
                          {faq.answer}
                        </Text>
                      </Box>
                    </Collapsible>

                    {!isLast && <Divider />}
                  </Box>
                );
              })}
            </BlockStack>
          </Card>
        </BlockStack>

        {/* ── Footer nudge ── */}
        <Card>
          <InlineStack align="space-between" blockAlign="center" wrap={false}>
            <BlockStack gap="100">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Still need help?
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Our support team typically responds within 24 hours on business
                days.
              </Text>
            </BlockStack>
            <Button
              variant="primary"
              onClick={() =>
                window.open(
                  buildGmailUrl(
                    "Support Request – Edge Timer",
                    "Hi Edge Timer Team,\n\nI need support with:\n\n[Describe your issue]\n\nShop URL: ",
                  ),
                  "_blank",
                )
              }
            >
              Email Support
            </Button>
          </InlineStack>
        </Card>

        <Box paddingBlockEnd="400" />
      </BlockStack>
    </Page>
  );
}
