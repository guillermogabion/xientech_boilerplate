import React, { useEffect, useState } from "react";
import { organizationService, Organization } from "../../services/organizationService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Modal from "../../components/modal/Modal";
import DeleteConfirmationModal from "../../components/modal/DeleteConfirmationModal";
import OrganizationForm from "./OrganizationForm";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import Badge from "../../components/ui/badge/Badge";

export default function OrganizationPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Delete States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [alert, setAlert] = useState<{ show: boolean; variant: "success" | "error"; message: string }>({
    show: false,
    variant: "success",
    message: "",
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getAll();
      setOrgs(data);
    } catch (err) {
      console.error("Load Orgs Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (org: Organization) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
  };

  const openDeleteModal = (id: number) => {
    setOrgToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (orgToDelete === null) return;
    setIsDeleting(true);
    try {
      await organizationService.delete(orgToDelete);
      setOrgs(orgs.filter((o) => o.id !== orgToDelete));
      setAlert({ show: true, variant: "success", message: "Organization deleted successfully." });
      setIsDeleteModalOpen(false);
    } catch (err) {
      setAlert({ show: true, variant: "error", message: "Failed to delete organization." });
    } finally {
      setIsDeleting(false);
      setOrgToDelete(null);
      setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 5000);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Organization Management" />
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          + Add Organization
        </Button>
      </div>

      {alert.show && (
        <div className="mb-6">
          <Alert variant={alert.variant} title={alert.variant === "success" ? "Success" : "Error"} message={alert.message} />
        </div>
      )}

      <ComponentCard title="Active Tenants / Organizations">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark text-left">
                <th className="py-4 px-4 font-medium text-black dark:text-white">Organization Name</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Contact</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-10">Loading...</td></tr>
              ) : orgs.map((org) => (
                <tr key={org.id} className="border-b border-stroke dark:border-strokedark">
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-black dark:text-white">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.address}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-black dark:text-white">{org.contactNumber}</td>
                  <td className="py-4 px-4">
                    <Badge 
                        variant="light" 
                        color={
                        org.subscriptionStatus === 'ACTIVE' ? 'success' : 
                        org.subscriptionStatus === 'TRIAL' ? 'primary' : 'error'
                        }
                    >
                        {org.subscriptionStatus}
                    </Badge>
                    {org.expiresAt && (
                        <p className="text-[10px] mt-1 text-gray-500">
                        Exp: {new Date(org.expiresAt).toLocaleDateString()}
                        </p>
                    )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedOrg ? "Edit Organization" : "Create Organization"}>
        <OrganizationForm 
          orgToEdit={selectedOrg} 
          onSuccess={() => { handleCloseModal(); loadOrganizations(); }} 
          onCancel={handleCloseModal} 
        />
      </Modal>

      {/* <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        loading={isDeleting} 
        status={deleteStatus}
      /> */}
    </>
  );
}                                                                                                                   