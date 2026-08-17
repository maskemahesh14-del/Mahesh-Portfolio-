import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import IdleProvider from "@/components/IdleProvider";
import PixelTransitionProvider from "@/components/PixelTransition";
import GlobalCursor from "@/components/GlobalCursor";
import GrainOverlay from "@/components/GrainOverlay";
import TopNav from "@/components/TopNav";
import Readout from "@/components/Readout";
import AttractPrompt from "@/components/AttractPrompt";
import IdleTetris from "@/components/IdleTetris";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Design portfolio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body>
        <SmoothScrollProvider>
          <IdleProvider>
            <PixelTransitionProvider>
              <GlobalCursor />
              <IdleTetris />
              <GrainOverlay />
              <TopNav />
              <Readout />
              <AttractPrompt />
              {children}
            </PixelTransitionProvider>
          </IdleProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
