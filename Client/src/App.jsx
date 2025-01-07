import "./App.scss";

import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Main from "../../next/src/app/routes/Main";

import Header from "../../next/src/app/components/Header";
import Footer from "../../next/src/app/components/Footer";

/* eslint-disable react/prop-types */
const Container = ({ children }) => {
  return (
    <>
      <div id="container">
        <Header />
        <br />
        {children} {/* PAGE CONTENT */}
      </div>

      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
