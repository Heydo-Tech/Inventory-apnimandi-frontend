import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Barcode() {
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState("");
  const navigate = useNavigate();

  const handleScan = () => {
    if (barcode) {
      alert(`Scanning barcode: ${barcode}`);
    } else {
      alert("Please enter a barcode before scanning.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (barcode && quantity) {
      alert(`Submitted:\nBarcode: ${barcode}\nQuantity: ${quantity}`);
      setBarcode("");
      setQuantity("");
    } else {
      alert("Please fill out all fields.");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center items-center p-5">
      <div className="relative w-full max-w-lg bg-white p-10 rounded-3xl shadow-lg">
        <div className="absolute top-2.5 left-2.5 right-[-2.5] bottom-[-2.5] bg-orange-400 rounded-3xl -z-10"></div>
        <img src="Apni Mandi.png" alt="Logo" className="w-32 mx-auto mb-6" />
        <h1 className="text-3xl font-semibold text-green-700 mb-6 text-center">
          User Count
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="barcode"
              className="block mb-2 text-lg font-medium text-gray-600 text-left"
            >
              Enter Barcode
            </label>
            <input
              type="text"
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter Barcode"
              required
              className="w-full p-4 bg-orange-400 text-white rounded-3xl text-lg placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="quantity"
              className="block mb-2 text-lg font-medium text-gray-600 text-left"
            >
              Enter Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
              min="0"
              required
              className="w-full p-4 bg-orange-400 text-white rounded-3xl text-lg placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <button
            type="button"
            onClick={handleScan}
            className="w-full bg-green-500 text-white p-4 rounded-3xl text-lg font-medium hover:bg-green-600 transform hover:scale-105 transition-all"
          >
            Scan
          </button>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-4 rounded-3xl text-lg font-medium mt-6 hover:bg-green-700 transform hover:scale-105 transition-all"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Barcode;
