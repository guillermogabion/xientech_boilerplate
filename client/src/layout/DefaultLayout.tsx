import React, { useState, useEffect, ReactNode } from 'react';
import Header from './AppHeader';
import Sidebar from './AppSidebar';
import { householdService } from '../services/householdService'; // Adjust path
import Alert from '../components/ui/alert/Alert'; // Adjust path

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    const handleSync = async () => {
      // 1. Check if we are online and have pending data
      const pendingData = JSON.parse(localStorage.getItem("pending_sync_households") || "[]");
      
      if (!navigator.onLine || pendingData.length === 0) return;

      console.log(`Connection restored! Syncing ${pendingData.length} records...`);
      setIsSyncing(true);

      try {
        // 2. Loop through and send to server
        for (const record of pendingData) {
          // Remove client-side helper fields before sending
          const { isOffline, createdAt, tempId, ...payload } = record;
          await householdService.create(payload);
        }

        // 3. Clean up
        localStorage.removeItem("pending_sync_households");
        setIsSyncing(false);
        setSyncSuccess(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => setSyncSuccess(false), 5000);
      } catch (error) {
        console.error("Background sync failed:", error);
        setIsSyncing(false);
      }
    };

    // Listen for the moment the browser goes from offline to online
    window.addEventListener('online', handleSync);
    
    // Also check immediately when the layout mounts (e.g., page refresh)
    handleSync();

    return () => window.removeEventListener('online', handleSync);
  }, []);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar  /> 

        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header />
          
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              
              {/* --- Global Sync Indicators --- */}
              <div className="fixed top-5 right-5 z-9999 w-80">
                {isSyncing && (
                  <Alert 
                    variant="info" 
                    title="Syncing Data" 
                    message="Uploading offline records to server..." 
                  />
                )}
                {syncSuccess && (
                  <Alert 
                    variant="success" 
                    title="Sync Complete" 
                    message="All offline data has been successfully saved." 
                  />
                )}
              </div>

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;