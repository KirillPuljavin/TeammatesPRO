import "./styles/global.scss";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "TeammatesPRO",
  description: "by Kirill P.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
