// Components
export { ClientsTable } from "./components/ClientsTable"
export { ClientForm } from "./components/ClientForm"
export { ClientsTableSkeleton } from "./components/ClientsTableSkeleton"
export { DeleteClientDialog } from "./components/DeleteClientDialog"
export { DeleteClientButton } from "./components/DeleteClientButton"
export { getColumns as getClientColumns } from "./components/columns"

// API
export { clientsApi } from "./api/clients-api"
export type { PaginatedResponse, ApiError } from "./api/clients-api"

// Types
export type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ClientsQueryParams,
  ClientFormData,
} from "./types"
