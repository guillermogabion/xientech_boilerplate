import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom"; 

interface User {
  username?: string;
  firstName?: string;
  pic?: string;
  designation?: any;
  role?: string;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Optimized for Base64 local storage only
  const formatBase64 = (pic: string) => {
    if (!pic) return "";
    // Remove potential extra quotes from stringified JSON
    let cleanPic = pic.replace(/^"|"$/g, '');
    
    if (cleanPic.startsWith("data:image")) {
      return cleanPic;
    }

    return `data:image/png;base64,${cleanPic}`;
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");
    closeDropdown();
    navigate("/signin");
  };

  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    if (loggedUser) {
      try {
        setUser(JSON.parse(loggedUser));
      } catch (err) {
        console.error("Invalid user data in localStorage");
      }
    }
  }, []);

  // Determine Initials for Fallback
  const getInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          {user?.pic ? (
            <img 
              src={formatBase64(user.pic)} 
              alt="User profile" 
              className="object-cover w-full h-full" 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm font-bold bg-gray-100 dark:bg-gray-800">
               {getInitial()}
            </div>
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {user?.username || user?.firstName}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user?.username}
          </span>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user?.role}
          </span>
         <div className="mt-3 flex flex-wrap gap-1.5">
            {(() => {
              const d = user?.designation;
              let list: string[] = [];
              if (d?.set && Array.isArray(d.set)) list = d.set;
              else if (Array.isArray(d)) list = d;
              else if (typeof d === 'string') list = [d];

              const finalItems = list.filter(item => item && item !== "NULL");
              if (finalItems.length === 0) return <span className="text-[10px] text-gray-400 uppercase">General Member</span>;

              const colors = [
                "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
                "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
              ];

              return finalItems.map((item, index) => (
                <span key={index} className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter ${colors[index % colors.length]}`}>
                  {item.replace(/_/g, " ")}
                </span>
              ));
            })()}
          </div>

          
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Edit profile
            </DropdownItem>
          </li>
        </ul>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}