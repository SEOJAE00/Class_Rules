import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Class Rules",
  description: "Rule Calculation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta name={metadata.title} content={metadata.description} />
      <script
          id="MathJax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
      ></script>
      <body>
        {children}
      </body>
    </html>
  );
}
