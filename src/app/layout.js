import "./styles/global.scss";
import Footer from "../components/Footer";
import Header from "../components/Header";

export const metadata = {
  title: "TeammatesPRO",
  description: "Kirill P.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
