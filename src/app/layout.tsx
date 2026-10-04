import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import { theme } from "@/styles/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHTX Voting",
  description: "Live audience voting",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" {...mantineHtmlProps} className="h-full" data-mantine-color-scheme="light">
      <head>
        <ColorSchemeScript defaultColorScheme="light" forceColorScheme="light" />
      </head>
      <body className="h-full min-h-full flex flex-col">
        <MantineProvider theme={theme} forceColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
