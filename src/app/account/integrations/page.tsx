import type { Metadata } from "next";
import { IntegrationsTab } from "../integrations-tab";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return <IntegrationsTab />;
}
