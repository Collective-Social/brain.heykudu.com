import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeyKudu | Clinical Super Agent",
  description: "Automating 116 years of documentation friction into a highly-structured clinical data asset at zero marginal cost.",
  openGraph: {
    title: "HeyKudu | Clinical Super Agent",
    description: "Automating 116 years of documentation friction into a highly-structured clinical data asset at zero marginal cost.",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="session-rewind" strategy="afterInteractive">
          {`
            !function (o) {
                var w = window;
                w.SessionRewindConfig = o;
                var f = document.createElement("script");
                f.async = 1, f.crossOrigin = "anonymous",
                  f.src = "https://rec.sessionrewind.com/srloader.js";
                var g = document.getElementsByTagName("head")[0];
                g.insertBefore(f, g.firstChild);
              }({
                apiKey: 'ttXErZctR3aSnUGvFDjGq7DHF0LkXMql4U38GMPc',
                startRecording: true,
              });
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#0A0714]">
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
