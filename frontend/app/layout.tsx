import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, BioRhyme } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const biorhyme = BioRhyme({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-biorhyme",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#dff140",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "CineMatch | Find Your Next Favourite Film",
    template: "%s | CineMatch",
  },
  description:
    "Enter any movie title and instantly get 10 similar film recommendations powered by TF-IDF and cosine similarity. No account, no tracking.",
  applicationName: "CineMatch",
  keywords: [
    "movie recommendations",
    "film recommendations",
    "similar movies",
    "movie finder",
    "what to watch",
    "content based filtering",
  ],
  authors: [{ name: "Swayam" }],
  creator: "Swayam",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "CineMatch | Find Your Next Favourite Film",
    description:
      "Enter any movie title and instantly get 10 similar film recommendations. No account, no tracking.",
    url: "https://movie.swayam.io",
    siteName: "CineMatch",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineMatch | Find Your Next Favourite Film",
    description:
      "Enter any movie title and instantly get 10 similar film recommendations.",
    creator: "@swayam",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${biorhyme.variable}`}
    >
      <body className="noise">{children}</body>
    </html>
  );
}
