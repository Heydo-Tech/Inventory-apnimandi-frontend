import { useState, useEffect } from "react";

function ProductInventoryViewer() {
  const [activeTab, setActiveTab] = useState("today");
  const [inventoryData, setInventoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  // Fetch data from the API
  const fetchProductInventory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://inventory.apnimandi.us/api2/inventory/getProductInventory?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await response.json();
      if (
        !data.productInventoryData ||
        data.productInventoryData.length === 0
      ) {
        setError("No product inventory items found for this period.");
        setInventoryData([]);
        setTotalPages(1);
      } else {
        setInventoryData(data.productInventoryData);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching product inventory data:", error);
      setError("Failed to load inventory data. Please try again later.");
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductInventory(currentPage);
  }, [currentPage]);

  // Filter data for "Today" and "History" tabs
  const todayDate = new Date().toISOString().split("T")[0];
  const filteredData = {
    today: inventoryData.filter((item) => item.currentDate === todayDate),
    history: inventoryData.filter((item) => item.currentDate !== todayDate)
  };

  // Display table items
  const displayItems = (items) => {
    if (items.length === 0) {
      return (
        <div className="text-center text-gray-600 text-lg italic py-8">
          No items found for this period.
        </div>
      );
    }

    // Sort items by date and time (newest first)
    const sortedItems = [...items].sort((a, b) => {
      const dateA = new Date(`${a.currentDate}T${a.currentTime}`);
      const dateB = new Date(`${b.currentDate}T${b.currentTime}`);
      return dateB - dateA;
    });

    const headers = Object.keys(items[0] || {}).filter(
      (key) => key !== "_id" && key !== "__v"
    );

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="p-4 text-left text-sm font-semibold text-white bg-blue-600 border-b border-gray-200"
                >
                  {header.replace(/([A-Z])/g, " $1").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  item.isTaken ? "bg-gray-100 opacity-75" : ""
                }`}
              >
                {headers.map((header) => (
                  <td key={header} className="p-4 text-sm text-gray-700">
                    {header === "expiryDate" && item[header]
                      ? new Date(item[header]).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : item[header] !== undefined
                        ? item[header]
                        : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Export to CSV
  const downloadExcel = () => {
    const currentItems =
      activeTab === "today" ? filteredData.today : filteredData.history;
    const headers = Object.keys(currentItems[0] || {}).filter(
      (key) => key !== "_id" && key !== "__v"
    );
    const csv = [
      headers.join(","),
      ...currentItems.map((row) =>
        headers
          .map((header) =>
            header === "expiryDate" && row[header]
              ? new Date(row[header]).toISOString().split("T")[0]
              : row[header] !== undefined
                ? row[header]
                : "N/A"
          )
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product_inventory_${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle pagination
  const changePage = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <nav className="bg-blue-600 text-white rounded-lg shadow-md mb-6">
          <div className="flex">
            {["today", "history"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 ${
                  activeTab === tab ? "bg-blue-800" : "hover:bg-blue-700"
                }`}
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab ? "page" : undefined}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Export Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={downloadExcel}
              className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 transition-colors"
            >
              Export to CSV
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">
                Loading inventory data...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <button
                onClick={() => fetchProductInventory(currentPage)}
                className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Retry
              </button>
            </div>
          ) : (
            <div>
              {displayItems(
                activeTab === "today"
                  ? filteredData.today
                  : filteredData.history
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => changePage("prev")}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
              >
                Previous
              </button>
              <span className="text-lg text-gray-700">{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                onClick={() => changePage("next")}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductInventoryViewer;
