import api, { getApiErrorMessage } from "../../services/api.tsx";
import type {
  AdminCustomerDetail,
  AdminCustomerSummary,
  AdminDashboardCharts,
  AdminDashboardSummary,
  AdminOrganizationDetail,
  AdminOrganizationSummary,
  AdminPackageInfo,
  AdminRecommendation,
  AdminUserAccount,
  BatchRecalculationSummary,
  CreateAdminUserRequest,
  CreateCustomerRequest,
  CreateOrganizationRequest,
  CustomerFilters,
  OrganizationFilters,
  RecommendationFilters,
  UpdateCustomerRequest,
  UpdateOrganizationRequest,
} from "./adminTypes";

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
}

export const getDashboardSummary = () =>
  unwrap<AdminDashboardSummary>(api.get("/admin/dashboard/summary"));

export const getDashboardCharts = () =>
  unwrap<AdminDashboardCharts>(api.get("/admin/dashboard/charts"));

export const getCustomers = (filters: CustomerFilters = {}) =>
  unwrap<AdminCustomerSummary[]>(api.get("/admin/customers", { params: filters }));

export const getCustomer = (id: number) =>
  unwrap<AdminCustomerDetail>(api.get(`/admin/customers/${id}`));

export const createCustomer = (request: CreateCustomerRequest) =>
  unwrap<AdminCustomerSummary>(api.post("/admin/customers", request));

export const updateCustomer = (id: number, request: UpdateCustomerRequest) =>
  unwrap<AdminCustomerSummary>(api.put(`/admin/customers/${id}`, request));

export const deleteCustomer = async (id: number) => {
  try {
    await api.delete(`/admin/customers/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
};

export const getOrganizations = (filters: OrganizationFilters = {}) =>
  unwrap<AdminOrganizationSummary[]>(api.get("/admin/organizations", { params: filters }));

export const getOrganization = (id: number) =>
  unwrap<AdminOrganizationDetail>(api.get(`/admin/organizations/${id}`));

export const createOrganization = (request: CreateOrganizationRequest) =>
  unwrap<AdminOrganizationSummary>(api.post("/admin/organizations", request));

export const updateOrganization = (id: number, request: UpdateOrganizationRequest) =>
  unwrap<AdminOrganizationSummary>(api.put(`/admin/organizations/${id}`, request));

export const deleteOrganization = async (id: number) => {
  try {
    await api.delete(`/admin/organizations/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
};

export const getPackages = () =>
  unwrap<AdminPackageInfo[]>(api.get("/admin/packages"));

export const getAdmins = () =>
  unwrap<AdminUserAccount[]>(api.get("/admin/admins"));

export const createAdmin = (request: CreateAdminUserRequest) =>
  unwrap<AdminUserAccount>(api.post("/admin/admins", request));

export const getRecommendations = (filters: RecommendationFilters = {}) =>
  unwrap<AdminRecommendation[]>(api.get("/admin/recommendations", { params: filters }));

export const approveRecommendation = (id: number) =>
  unwrap<AdminRecommendation>(api.post(`/admin/recommendations/${id}/approve`));

export const rejectRecommendation = (id: number) =>
  unwrap<AdminRecommendation>(api.post(`/admin/recommendations/${id}/reject`));

export const recalculateAllRecommendations = () =>
  unwrap<BatchRecalculationSummary>(api.post("/admin/recommendations/recalculate"));
