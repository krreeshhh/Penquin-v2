import { getSidebarTree } from "@/lib/docs";
import ClientLayout from "./client-layout"; // Import the renamed client layout

export default async function DocsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = getSidebarTree(); // Fetch data on the server
  return <ClientLayout sidebar={sidebar}>{children}</ClientLayout>;
}