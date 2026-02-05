// Components
export { RolesTable } from "./components/RolesTable"
export { RoleForm } from "./components/RoleForm"
export { PermissionsMatrix } from "./components/PermissionsMatrix"
export { DeleteRoleDialog } from "./components/DeleteRoleDialog"
export { CreateRoleButton } from "./components/CreateRoleButton"
export { getColumns as getRoleColumns } from "./components/columns"

// API
export { rolesApi } from "./api/roles-api"
export type { ApiError } from "./api/roles-api"

// Types
export type {
  Role,
  Permission,
  PermissionsByResource,
  CreateRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
  CreateRoleFormData,
  UpdateRoleFormData,
} from "./types"
export { createRoleFormSchema, updateRoleFormSchema, ACTION_DISPLAY_NAMES } from "./types"
