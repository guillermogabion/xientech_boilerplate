import React, { useState, useEffect } from "react";
import { organizationService, CreateOrgInput, Organization } from "../../services/organizationService";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";

interface OrgFormProps {
  orgToEdit?: Organization | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OrganizationForm({ orgToEdit, onSuccess, onCancel }: OrgFormProps) {
  const [formData, setFormData] = useState<CreateOrgInput>({
    name: "",
    address: "",
    contactNumber: "",
    adminEmail: "",
    adminUsername: "", // Add this
    adminFirstName: "",
    adminLastName: "",
    adminPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditMode = !!orgToEdit;

  useEffect(() => {
    if (orgToEdit) {
      setFormData({
        ...formData,
        name: orgToEdit.name || "",
        address: orgToEdit.address || "",
        contactNumber: orgToEdit.contactNumber || "",
      });
    }
  }, [orgToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditMode && orgToEdit) {
        await organizationService.update(orgToEdit.id, {
            name: formData.name,
            address: formData.address,
            contactNumber: formData.contactNumber
        });
      } else {
        await organizationService.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert 
          variant="error" 
          title="Registration Failed" 
          message={error} // This will now show "Email is already taken" or "Username is already taken"
        />
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-black dark:text-white border-b pb-2">General Information</h3>
        <div>
          <label className="mb-2 block text-sm font-medium">Organization Name</label>
          <input
            type="text"
            required
            className="w-full rounded border border-stroke py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Contact Number</label>
            <input
              type="text"
              className="w-full rounded border border-stroke py-2 px-4 dark:bg-boxdark"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Address</label>
            <input
              type="text"
              className="w-full rounded border border-stroke py-2 px-4 dark:bg-boxdark"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      {!isEditMode && (
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-black dark:text-white border-b pb-2">Initial Admin Account</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              required
              className="w-full rounded border border-stroke py-2 px-4 dark:bg-boxdark"
              onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              className="w-full rounded border border-stroke py-2 px-4 dark:bg-boxdark"
              onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
            />
          </div>
          <input
            type="email"
            placeholder="Admin Email"
            required
            className="w-full rounded border border-stroke py-2 px-4 dark:bg-boxdark"
            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
          />
          <input
            type="text"
            placeholder="Admin Username"
            required
            className="w-full rounded border border-stroke py-2 px-4 dark:bg-boxdark"
            value={formData.adminUsername}
            onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
          />
          <input
            type="password"
            placeholder="Admin Password"
            required
            className="w-full rounded border border-stroke py-2 px-4 dark:bg-boxdark"
            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
          />
        </div>
      )}

      <div className="flex gap-4 pt-6">
        <Button disabled={loading} className="w-full">
          {loading ? "Processing..." : isEditMode ? "Update Organization" : "Create Organization"}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </form>
  );
}