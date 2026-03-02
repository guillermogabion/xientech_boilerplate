import React, { useState, useEffect } from "react";
import { userService, User } from "../../services/userService";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { formatEnum } from "../../utils/formatText";

interface UserFormProps {
  userToEdit?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}



const ROLES = ["SUPER_ADMIN", "ADMIN", "CAPTAIN", "COUNCILOR", "SECRETARY", "TREASURER", "STAFF", "BHW", "BNS", "TANOD", "SK_CHAIRMAN"];

const DESIGNATIONS = [
  "NULL",
  "RESIDENTS",
  "PEACE_AND_ORDER",
  "HEALTH_AND_SANITATION",
  "FINANCE_AND_APPROPRIATIONS",
  "INFRASTRUCTURE_AND_ENVIRONMENT",
  "EDUCATION_CULTURE_SPORTS",
  "AGRICULTURE_AND_LIVELIHOOD",
  "WOMEN_CHILDREN_FAMILY",
  "SENIOR_CITIZEN_PWD",
  "DISASTER_RISK_REDUCTION",
  "HUMAN_RIGHTS_LEGAL",
];

export default function UserForm({ userToEdit, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "STAFF", // Ensure this defaults to Uppercase
    designation: ["NULL"], // Ensure this defaults to Uppercase
    pic: "",
  });

  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isEditMode = !!userToEdit;

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        firstName: userToEdit.firstName || "",
        lastName: userToEdit.lastName || "",
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        password: "", 
        role: userToEdit.role || "STAFF",
        designation: Array.isArray(userToEdit.designation) 
        ? userToEdit.designation 
        : [userToEdit.designation || "NULL"],
        pic: userToEdit.pic || "",
      });
    }
  }, [userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionStatus("idle");

    try {
      // 1. Filter out non-strings and placeholders before uppercasing
      const sanitizedDesignations = formData.designation
        .filter((d): d is string => typeof d === 'string' && d.trim() !== "" && d !== "NULL")
        .map((d) => d.toUpperCase());

      // 2. Prepare data, ensuring we send an empty array [] instead of ["NULL"] 
      // if no designations are selected.
      const dataToSend = { 
        ...formData,
        role: formData.role.toUpperCase(),
        designation: sanitizedDesignations.length > 0 ? sanitizedDesignations : ["NULL"]
      };

      if (isEditMode && userToEdit) {
        await userService.update(userToEdit.id, dataToSend);
      } else {
        await userService.create(dataToSend);
      }

      setSubmissionStatus("success");
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      // ... error handling
    } finally {
      setLoading(false);
    }
  };
  const addDesignation = (val: string) => {
    // If the current state is just ["NULL"], replace it with the new value
    const current = formData.designation.filter(d => d !== "NULL");
    if (!current.includes(val)) {
      setFormData({
        ...formData,
        designation: [...current, val],
      });
    }
  };

  const removeDesignation = (valToRemove: string) => {
    const updated = formData.designation.filter((d) => d !== valToRemove);
    // If empty, you might want to default back to ["NULL"]
    setFormData({
      ...formData,
      designation: updated.length === 0 ? ["NULL"] : updated,
    });
  };

  const validDesignations = formData.designation.filter(d => 
    typeof d === 'string' && // 1. Must be a string
    d.trim() !== "" &&       // 2. Must not be empty
    d !== "NULL"             // 3. Must not be the placeholder
  );
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submissionStatus === "success" && (
        <Alert variant="success" title="Success" message="Barangay official record saved." />
      )}
      {submissionStatus === "error" && (
        <Alert variant="error" title="Action Failed" message={errorMessage} />
      )}

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-black dark:text-white font-medium">First Name</label>
          <input
            type="text"
            required
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-strokedark"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-2 block text-black dark:text-white font-medium">Last Name</label>
          <input
            type="text"
            required
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-strokedark"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      {/* Account Info Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-black dark:text-white font-medium">Username</label>
          <input
            type="text"
            required
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-2 block text-black dark:text-white font-medium">Email</label>
          <input
            type="email"
            required
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="mb-2 block text-black dark:text-white font-medium">
          Password {isEditMode && <span className="text-xs text-gray-400 font-normal">(Leave blank to keep current)</span>}
        </label>
        <input
          type="password"
          required={!isEditMode}
          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      {/* Dropdowns Row */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-2 block font-medium text-black dark:text-white">Role (Access Level)</label>
          <select
            value={formData.role}
            className="w-full rounded border border-stroke bg-transparent py-2.5 px-4 outline-none dark:border-strokedark dark:bg-boxdark"
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {formatEnum(r)}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label className="mb-2 block font-medium text-black dark:text-white">
            Committee / Designation
          </label>
          
          {/* 1. Create a "Safe" list of designations to use below */}
          {(() => {
            const validDesignations = formData.designation.filter(d => 
              typeof d === 'string' && d.trim() !== "" && d !== "NULL"
            );

            return (
              <>
                {/* 2. The Scrollable Chip Area */}
                <div 
                  className={`w-full rounded-t border border-stroke bg-transparent transition focus-within:border-primary dark:border-strokedark dark:bg-boxdark ${
                    validDesignations.length > 0 ? "border-b-0 p-2" : "hidden"
                  }`}
                >
                  <div className="max-h-28 overflow-y-auto flex flex-wrap gap-2 custom-scrollbar">
                    {validDesignations.map((d) => (
                      <span 
                        key={d} 
                        className="flex items-center gap-1 bg-primary/[0.1] dark:bg-white/10 text-primary dark:text-white border border-primary/20 px-2 py-1 rounded text-sm animate-fade-in"
                      >
                        {formatEnum(d)}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDesignation(d);
                          }}
                          className="ml-1 hover:text-danger transition-colors font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. The Select Box */}
                <select
                  className={`w-full border border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark cursor-pointer ${
                    validDesignations.length > 0 ? "rounded-b" : "rounded"
                  }`}
                  value=""
                  onChange={(e) => addDesignation(e.target.value)}
                >
                  <option value="" disabled>
                    {validDesignations.length > 0 
                      ? "+ Add another designation..." 
                      : "Select Designations..."}
                  </option>
                  {DESIGNATIONS.filter(d => d !== "NULL" && !formData.designation.includes(d)).map((d) => (
                    <option key={d} value={d} className="dark:bg-boxdark text-black dark:text-white">
                      {formatEnum(d)}
                    </option>
                  ))}
                </select>
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button disabled={loading} className="w-full justify-center">
          {loading ? "Processing..." : isEditMode ? "Update Official" : "Create Official"}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel} className="w-full justify-center">
          Cancel
        </Button>
      </div>
    </form>
  );
}