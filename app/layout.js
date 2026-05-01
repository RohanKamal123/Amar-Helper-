import "./globals.css";

export const metadata = {
  title: "Amar Doc-Helper",
  description: "Bangladesh Govt Document Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}