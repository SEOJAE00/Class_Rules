import "./globals.css";
import { LangProvider } from "./context/LangContext";
import { AdvancedSearchProvider } from './context/AdvancedSearch';
import { SelectedFileProvider } from './context/SelectedFileContext';

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
      <body id="__next">
        <LangProvider>
          <AdvancedSearchProvider>
            <SelectedFileProvider>
              {children}
            </SelectedFileProvider>
          </AdvancedSearchProvider>
        </LangProvider>
      </body>
    </html>
  );
}
