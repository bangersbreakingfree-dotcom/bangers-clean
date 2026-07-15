import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL("https://bangersprints.com"),

  title: "BANGERS | Exclusive Photography Club",

  description:
    "Rare travel photography delivered quarterly. Never posted online. Never sold publicly. Only available to members.",

  openGraph: {
    title: "BANGERS | Exclusive Photography Club",
    description:
      "Rare travel photography delivered quarterly. Never posted online. Never sold publicly.",
    url: "https://bangersprints.com",
    siteName: "BANGERS",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "BANGERS | Exclusive Photography Club",
    description:
      "Rare travel photography delivered quarterly.",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
