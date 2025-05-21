import React, { useState } from "react";
import WasteInventoryViewer from "./WasteInventoryViewer";
import ProductInventoryViewer from "./ProductInventoryViewer";

function Barcode() {
  const [activeInventory, setActiveInventory] = useState("waste");

  const menuItems = [
    {
      name: "Waste Inventory",
      id: "waste",
      onClick: () => setActiveInventory("waste")
    },
    {
      name: "Product Inventory",
      id: "product",
      onClick: () => setActiveInventory("product")
    }
  ];

  const renderContent = () => {
    const ViewerComponent =
      activeInventory === "waste"
        ? WasteInventoryViewer
        : ProductInventoryViewer;

    return (
      <div className="p-6 sm:p-8">
        <ViewerComponent />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
          <img
            src="Apni Mandi.png"
            alt="Apni Mandi Farmers Market"
            className="h-16 w-auto"
          />
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 ${
                  activeInventory === item.id
                    ? "bg-blue-800 text-white"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
                onClick={item.onClick}
                aria-current={activeInventory === item.id ? "page" : undefined}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* Footer (Optional) */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Apni Mandi Farmers Market. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Barcode;
