import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Barcode from "./pages/Barcode";
import Product from "./pages/Product";
import Waste from "./pages/Waste";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/barcode" element={<Barcode />} />
        <Route path="/product" element={<Product />} />
        <Route path="/waste" element={<Waste />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
