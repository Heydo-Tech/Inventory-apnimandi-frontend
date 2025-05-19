import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Product() {
  const [formData, setFormData] = useState({
    vendor: "",
    invoiceNo: "",
    barcode: "",
    quantity: "",
    cartons: "",
    productImage: "",
    expiryDate: "",
    productLost: ""
  });
  const [fileName, setFileName] = useState("No file selected");
  const [lastProduct, setLastProduct] = useState("None");
  const [productDetails, setProductDetails] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkPageProtection = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/tokendata", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const userData = await response.json();
      if (userData.role !== "Product Management") {
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

const fetchRecentProducts = async (username) => {
  if (!username) {
    console.error("No username provided to fetchRecentProducts");
    setError("Username is required to fetch recent products.");
    return;
  }
  
  try {
    console.log("Fetching recent products for:", username);
    
    const response = await fetch(
      "http://localhost:3000/inventory/recentproduct",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include"
      }
    );
    
    const responseData = await response.json();
    
    if (!response.ok) {
      if (response.status === 404) {
        // Handle the case where no products were found
        console.log("No recent products found for user:", username);
        setLastProduct("No products found");
      } else {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${responseData.message || "Unknown error"}`);
      }
    } else {
      console.log("Recent product fetched successfully:", responseData);
      setLastProduct(responseData.lastProduct || "Unknown Product");
    }
  } catch (error) {
    console.error("Error fetching recent products:", error);
    setError(`Failed to fetch recent products: ${error.message}. Please try again.`);
    setLastProduct("Error retrieving product");
  }
};

  const handleScan = async () => {
    const barcode = formData.barcode || "Scanned Barcode";
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

    const data = {
      barcodeOrSKU: formData.barcode,
      quantityPerCarton: formData.quantity,
      noOfCarton: formData.cartons,
      establishment: userData.establishmentId,
      username: userData.username,
      imagery: fileName,
      role: userData.role,
      productName: localStorage.getItem("productName"),
      vendorName: formData.vendor,
      invoiceNumber: formData.invoiceNo,
      expiryDate: formData.expiryDate,
      isProductLost: !!formData.productLost
    };

    try {
      const response = await fetch(
        "http://localhost:3000/inventory/inventory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include"
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      await response.json();
      setLastProduct(data.productName || "N/A");
      resetForm();
      alert("Data successfully submitted!");
      setError("");
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("Failed to submit data. Please try again.");
    }
  };

  const updateInventory = () => {
    alert("Inventory updated!");
  };

  const resetForm = () => {
    setFormData({
      vendor: "",
      invoiceNo: "",
      barcode: "",
      quantity: "",
      cartons: "",
      productImage: "",
      expiryDate: "",
      productLost: ""
    });
    setFileName("No file selected");
    setProductDetails(null);
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file ? file.name : "No file selected");
    setFormData({ ...formData, productImage: file ? file.name : "" });
  };

  useEffect(() => {
    checkPageProtection().then((userData) => {
      if (userData) fetchRecentProducts(userData.username);
    });
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center items-center p-5">
      <div className="relative w-full max-w-3xl h-[80vh] bg-white p-6 rounded-3xl shadow-lg overflow-y-auto">
        <div className="absolute top-2.5 left-2.5 right-[-2.5] bottom-[-2.5] bg-orange-400 rounded-3xl -z-10"></div>
        <img src="Apni Mandi.png" alt="Logo" className="w-32 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Product Inventory Management
        </h1>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-4 py-2 rounded-3xl mx-auto block mb-6"
        >
          Logout
        </button>
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}
        <h2 className="text-xl font-semibold text-green-600 mb-4">
          Last Product Added: <span>{lastProduct}</span>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              id="vendor"
              value={formData.vendor}
              onChange={(e) =>
                setFormData({ ...formData, vendor: e.target.value })
              }
              placeholder="Choose or type vendor name"
              list="vendorList"
              className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <datalist id="vendorList">
              <option value="Abdul Hamidi" />
              <option value="Afghan Spice LLC" />
              {/* Add other vendors as needed */}
            </datalist>
          </div>
          <div className="mb-4">
            <label htmlFor="invoiceNo" className="block mb-2 text-gray-600">
              Invoice No./ PO No.:
            </label>
            <input
              type="text"
              id="invoiceNo"
              value={formData.invoiceNo}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNo: e.target.value })
              }
              placeholder="Enter invoice number"
              required
              className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="barcode" className="block mb-2 text-gray-600">
              Enter Barcode or SKU:
            </label>
            <input
              type="text"
              id="barcode"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              placeholder="Scan or type barcode"
              required
              className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <button
              type="button"
              onClick={handleScan}
              className="w-full bg-green-600 text-white p-3 rounded-3xl mt-2 hover:bg-green-700 transform hover:scale-105 transition-all"
            >
              Scan Barcode
            </button>
          </div>
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            Product Details
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg mb-4 text-center">
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
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="quantity" className="block mb-2 text-gray-600">
                Quantity per Carton:
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="Enter quantity per carton"
                min="0"
                required
                className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="cartons" className="block mb-2 text-gray-600">
                No. of Cartons:
              </label>
              <input
                type="number"
                id="cartons"
                value={formData.cartons}
                onChange={(e) =>
                  setFormData({ ...formData, cartons: e.target.value })
                }
                placeholder="Enter no of cartons"
                min="0"
                required
                className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="productImage" className="block mb-2 text-gray-600">
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
          <div className="mb-4">
            <label htmlFor="expiryDate" className="block mb-2 text-gray-600">
              Expiry Date:
            </label>
            <input
              type="date"
              id="expiryDate"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              className="w-full p-3 bg-orange-400 text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="productLost" className="block mb-2 text-gray-600">
              Is Product Lost:
            </label>
            <input
              type="text"
              id="productLost"
              value={formData.productLost}
              onChange={(e) =>
                setFormData({ ...formData, productLost: e.target.value })
              }
              placeholder="Enter Price If Lost"
              className="w-full p-3 bg-orange-400 text-white rounded-3xl placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-3xl hover:bg-green-700 transform hover:scale-105 transition-all"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={updateInventory}
            className="w-full bg-green-500 text-white p-3 rounded-3xl mt-2 hover:bg-green-600 transform hover:scale-105 transition-all"
          >
            Update Inventory
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-full bg-green-700 text-white p-3 rounded-3xl mt-2 hover:bg-green-800 transform hover:scale-105 transition-all"
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
}

export default Product;
