import './App.css';
import HomePage from './components/Home';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import BrowsePage from './components/BrowsePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/browse" element={<BrowsePage/>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
