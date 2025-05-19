import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Waste() {
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fileName, setFileName] = useState("No file selected");
  const [productDetails, setProductDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkPageProtection = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/tokendata", {
        method: "GET", // Changed to GET since no token is sent in body
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const userData = await response.json();
      if (userData.role !== "Waste Management") {
        setError("Unauthorized access. Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
        return null;
      }
      return userData;
    } catch (error) {
      console.error("User not authenticated:", error);
      setError("Authentication failed. Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
      return null;
    }
  };

  const selectProduct = async () => {
    const barcode = sku || "Scanned Barcode";
    try {
      const response = await fetch("http://localhost:3000/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const product = await response.json();
      localStorage.setItem("productName", product.productName); // Kept for form logic
      setProductDetails(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      setProductDetails({ error: error.message });
      setError("Failed to fetch product. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = await checkPageProtection();
    if (!userData) return;

    const body = {
      establishment: userData.establishmentId,
      username: userData.username,
      barcodeOrSKU: sku,
      quantityPerCarton: quantity,
      productName: localStorage.getItem("productName"),
      role: userData.role
    };

    try {
      const response = await fetch(
        "http://localhost:3000/inventory/inventory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include"
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      alert("Data Added Successfully");
      setSku("");
      setQuantity("");
      setFileName("No file selected");
      setProductDetails(null);
      setError("");
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to submit data. Please try again.");
    }
  };

  async function searchProduct(query) {
    if (!query) return;
    const dataList = document.getElementById("productList");
    dataList.innerHTML = "";
    try {
      const response = await fetch(
        `http://localhost:3000/product/search?query=${query}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const products = await response.json();
      console.log("Fetched products:", products);
      setProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setError("Failed to search products. Please try again.");
    }
  }

  const debouncedSearch = (value) => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => searchProduct(value), 250);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file ? file.name : "No file selected");
  };

  useEffect(() => {
    checkPageProtection();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center items-center p-5">
      <div className="relative w-full max-w-lg bg-white p-8 rounded-3xl shadow-lg">
        <div className="absolute top-2.5 left-2.5 right-[-2.5] bottom-[-2.5] bg-orange-400 rounded-3xl -z-10"></div>
        <img src="Apni Mandi.png" alt="Logo" className="w-24 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Waste Management
        </h1>
        <button
          onClick={() => navigate("/")} // Simplified logout
          className="bg-red-500 text-white px-4 py-2 rounded-3xl mx-auto block mb-6"
        >
          Logout
        </button>
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="sku" className="block mb-2 text-gray-600 text-left">
              Enter Name or SKU:
            </label>
            <input
              type="text"
              id="sku"
              value={sku}
              onChange={(e) => {
                setSku(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder="Scan or type barcode"
              list="productList"
              required
              className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <datalist id="productList">
              {Array.isArray(products) &&
                products.map((product) => (
                  <option
                    key={product.barcode || product.sku}
                    value={product.barcode || product.sku}
                  >
                    {product.productName}
                  </option>
                ))}
            </datalist>
          </div>
          <div className="mb-6">
            <label
              htmlFor="quantity"
              className="block mb-2 text-gray-600 text-left"
            >
              Waste Quantity (in Lb or number):
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity per carton"
              min="0"
              required
              className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <button
            type="button"
            onClick={selectProduct}
            className="w-full bg-green-500 text-white p-3 rounded-3xl mb-4 hover:bg-green-600 transform hover:scale-105 transition-all"
          >
            Select
          </button>
          <div className="mb-6">
            <label
              htmlFor="productImage"
              className="block mb-2 text-gray-600 text-left"
            >
              Capture Product Image:
            </label>
            <div className="relative">
              <label
                htmlFor="productImage"
                className="block w-full p-3 bg-orange-400 text-white text-center rounded-3xl cursor-pointer hover:bg-orange-600 transform hover:scale-105 transition-all"
              >
                Choose Image
              </label>
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="block mt-2 text-sm text-gray-600 italic">
                {fileName}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-3xl hover:bg-green-700 transform hover:scale-105 transition-all"
          >
            Submit
          </button>
        </form>
        <div className="mt-6 text-center">
          {productDetails ? (
            productDetails.error ? (
              <p>{productDetails.error}</p>
            ) : (
              <>
                <p>
                  <strong>Product Name:</strong> {productDetails.productName}
                </p>
                <p>
                  <strong>SKU:</strong> {productDetails.sku || "N/A"}
                </p>
                <p>
                  <strong>Barcode:</strong> {productDetails.barcode}
                </p>
              </>
            )
          ) : (
            <p>No product details available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Waste;
