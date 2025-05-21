import { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

function WasteInventoryViewer() {
  const [activeTab, setActiveTab] = useState("today");
  const [inventoryData, setInventoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch data from the API
  const fetchWasteInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://inventory.apnimandi.us/api2/inventory/getWasteInventory`,
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
      if (data.data.length === 0) {
        setError("No waste inventory items found for this period.");
        setInventoryData([]);
        setTotalPages(1);
      } else {
        setInventoryData(data.data);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching waste inventory data:", error);
      setError("Failed to load inventory data. Please try again later.");
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteInventory(currentPage);
  }, [currentPage]);

  // Filter data for "Today" and "History" tabs
  const todayDate = new Date().toISOString().split("T")[0];
  const filteredData = {
    today: inventoryData.filter((item) => item.currentDate === todayDate),
    history: inventoryData.filter((item) => item.currentDate !== todayDate),
    allData: inventoryData
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
            {items.reverse().map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {headers.map((header) => (
                  <td key={header} className="p-4 text-sm text-gray-700">
                    {typeof item[header] === "object" && item[header] !== null
                      ? JSON.stringify(item[header])
                      : item[header] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Aggregate quantities by store for Pie Chart
  const aggregateQuantitiesByStore = (data) => {
    const storeQuantities = {
      Sunnyvale: 0,
      Milpitas: 0,
      Fremont: 0,
      Other: 0
    };

    data.forEach((item) => {
      const store = item.storeName;
      const quantity = parseInt(item.quantity, 10) || 0;
      if (storeQuantities[store] !== undefined) {
        storeQuantities[store] += quantity;
      } else {
        storeQuantities.Other += quantity;
      }
    });

    return storeQuantities;
  };

  const pieChartData = {
    labels: Object.keys(aggregateQuantitiesByStore(filteredData.allData)),
    datasets: [
      {
        label: "Waste Quantities by Store",
        data: Object.values(aggregateQuantitiesByStore(filteredData.allData)),
        backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFD166"],
        borderColor: ["#D9534F", "#3CA8A0", "#3A9BBF", "#E8B923"],
        borderWidth: 1,
        hoverOffset: 12
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw} units`
        }
      }
    }
  };

  // Aggregate date-wise quantities for Bar Chart
  const aggregateDateWiseQuantities = (data) => {
    const dateStoreQuantities = {};
    data.forEach((item) => {
      const date = item.currentDate;
      const store = item.storeName;
      const quantity = parseInt(item.quantity, 10) || 0;

      if (!dateStoreQuantities[date]) {
        dateStoreQuantities[date] = {};
      }
      if (!dateStoreQuantities[date][store]) {
        dateStoreQuantities[date][store] = 0;
      }
      dateStoreQuantities[date][store] += quantity;
    });
    return dateStoreQuantities;
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const prepareChartData = (dateStoreQuantities) => {
    const dates = Object.keys(dateStoreQuantities);
    const stores = [
      ...new Set(
        Object.values(dateStoreQuantities).flatMap((storeData) =>
          Object.keys(storeData)
        )
      )
    ];

    const datasets = stores.map((store) => ({
      label: store,
      data: dates.map((date) => dateStoreQuantities[date][store] || 0),
      backgroundColor: getRandomColor(),
      borderColor: "#1F2937",
      borderWidth: 1
    }));

    return {
      labels: dates,
      datasets
    };
  };

  const barChartData = prepareChartData(
    aggregateDateWiseQuantities(filteredData.allData)
  );

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw} units`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false },
        title: {
          display: true,
          text: "Date",
          font: { size: 14, weight: "bold" }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantity (Units)",
          font: { size: 14, weight: "bold" }
        }
      }
    }
  };

  // Export to CSV
  const exportToExcel = () => {
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
            typeof row[header] === "object" && row[header] !== null
              ? JSON.stringify(row[header])
              : row[header] || ""
          )
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waste_inventory_${activeTab}.csv`;
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
              onClick={exportToExcel}
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
                onClick={fetchWasteInventory}
                className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="mb-8">
                {displayItems(
                  activeTab === "today"
                    ? filteredData.today
                    : filteredData.history
                )}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Waste Quantities by Store
                  </h3>
                  <div className="h-80">
                    <Pie data={pieChartData} options={pieChartOptions} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Waste Quantities by Date
                  </h3>
                  <div className="h-80">
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>
              </div>
            </>
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

export default WasteInventoryViewer;
