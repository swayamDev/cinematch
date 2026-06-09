import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "CineMatch — Find Your Next Favourite Film",
  description:
    "Content-based movie recommendations powered by TF-IDF and cosine similarity. Enter any film, get 10 similar titles instantly.",
  openGraph: {
    title: "CineMatch",
    description: "Find movies similar to what you love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${biorhyme.variable}`}>
      <body className="noise">{children}</body>
    </html>
  );
}
