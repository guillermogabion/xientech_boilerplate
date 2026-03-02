import React, { useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import Alert from "../components/ui/alert/Alert"; // Ensure path is correct

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  
  // Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

 

  return (
    <div className="min-h-screen xl:flex">
      {/* Global Sync Notification Container */}
      <div className="fixed top-20 right-5 z-[9999] w-72 md:w-96 pointer-events-none">
        {isSyncing && (
          <div className="pointer-events-auto shadow-2xl animate-pulse">
            <Alert 
              variant="info" 
              title="Syncing..." 
              message="Uploading offline data to the server." 
            />
          </div>
        )}
        {syncSuccess && (
          <div className="pointer-events-auto shadow-2xl animate-bounce">
            <Alert 
              variant="success" 
              title="Sync Success" 
              message="All offline records are now saved to the database." 
            />
          </div>
        )}
      </div>

      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;