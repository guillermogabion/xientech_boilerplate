import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from '../context/AuthContext';
// Assume these icons are imported from an icon library
import {
  AccountBalanceOutlinedIcon,
  AdminPanelSettingsOutlinedIcon,
  ChevronDownIcon,
  Diversity3OutlinedIcon,
  FolderSpecialOutlinedIcon,
  GridIcon,
  HealthAndSafetyOutlinedIcon,
  HistoryToggleOffOutlinedIcon,
  HorizontaLDots,
  PageIcon,
  PeaceOrderTab,
  RecyclingOutlinedIcon,
  ResidentTabIcon,
  WorkspacePremiumOutlinedIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type Role = 
  | "ADMIN" 
  | "STAFF" 
  | "TEACHER" 
  | "ADMIN" 
  | "SUPER_ADMIN";



type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  isResidentOnly?: boolean; // Add this
  allowedRoles?: Role[];
  permission?: string;
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean;
    new?: boolean
    allowedRoles?: Role[];
    permission?: string;

  }[];
  
};

const adminNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },

  {
    name: "Administrative",
    icon: <AdminPanelSettingsOutlinedIcon />,
    permission: "ACCESS_ADMIN",
    subItems: [
      { name: "User Accounts", path: "/admin/users" },
      { name: "Import Residents", path: "/admin/import" },
      { name: "Permissions", path: "/admin/permissions" },
      { name: "Purok Management", path: "/admin/purok" },
      { name: "Subscription", path: "/admin/subscription" },
      { name: "Organization Onboarding", path: "/admin/organization", permission: "" },
      { name: "System Logs", path: "/admin/logs", permission: "" },
    ],
  },
  
];

const residentNavItems: NavItem[] = [
 
]

const othersItems: NavItem[] = [
 
];

const AppSidebar: React.FC = () => {
  const { user, loading } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const userRole = user?.role;
  
  const filteredItems = useMemo(() => {
    if (!user) return [];

    const userRole = user.role;
    const rawDesignation = user.designation;
    const userDesignation = (rawDesignation && typeof rawDesignation === 'object' && 'set' in rawDesignation) 
      ? (rawDesignation.set as string[]) 
      : (Array.isArray(rawDesignation) ? rawDesignation : []);

    const isEmptyUser = 
      (!userRole || userRole === 'undefined') && 
      (userDesignation.length === 0 || (userDesignation.length === 1 && userDesignation[0] === 'NULL'));

    if (isEmptyUser) return residentNavItems;

    // We map and filter in one go using reduce or map+filter
    return adminNavItems
      .map((item): NavItem | null => {
        // 1. Filter the sub-items first
        const filteredSubItems = item.subItems?.filter(sub => {
          // If sub-item has specific role requirements, restrict access
          if (sub.allowedRoles && !sub.allowedRoles.includes(userRole as any)) {
            return false;
          }
          return true;
        });

        // 2. Authorization Logic
        const hasAllowedRoles = !!(item.allowedRoles && item.allowedRoles.length > 0);

        const isRoleAuthorized = userRole && item.allowedRoles?.includes(userRole as any);
        let isParentAuthorized = false;

        // Super Admin and Admin get base access, but sub-items were already pruned above
        if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
          isParentAuthorized = true;
        } else if (!hasAllowedRoles) {
          isParentAuthorized = true;
        } else {
          isParentAuthorized = !!(isRoleAuthorized);
        }

        if (!isParentAuthorized) return null;

        // Explicitly return a NavItem structure
        return { 
          ...item, 
          subItems: filteredSubItems 
        };
      })
      .filter((item): item is NavItem => item !== null); // This should now work correctly
  }, [user]);

  
  useEffect(() => {
    let submenuMatched = false;
    filteredItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location.pathname, isActive, user, filteredItems.length]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      // Timeout ensures the DOM is painted so scrollHeight isn't 0
      const timeoutId = setTimeout(() => {
        if (subMenuRefs.current[key]) {
          setSubMenuHeight((prev) => ({
            ...prev,
            [key]: subMenuRefs.current[key]?.scrollHeight || 0,
          }));
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [openSubmenu, filteredItems]);


  if (loading) return null;

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => 
      prev?.type === menuType && prev?.index === index ? null : { type: menuType, index }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );


  console.log("Current User Auth:", { role: userRole});
  console.log("FULL USER OBJECT:", user);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="./images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="./images/logo/logo-icon.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {/* {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )} */}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
