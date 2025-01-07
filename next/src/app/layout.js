import "./styles/global.scss";

export const metadata = {
  title: "TeammatesPRO",
  description: "Kirill P.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
