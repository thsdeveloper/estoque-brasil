import { z } from "zod"

// Re-export types from shared package
export type {
  User,
  Role,
  Permission,
  UserPermissions,
  CreateUserInput,
  UpdateUserInput,
  UsersQueryParams,
  PaginatedUsers,
  PermissionAction,
  PermissionResource,
  SystemRoleName,
} from "@estoque-brasil/types"

export { SYSTEM_ROLES, PERMISSION_RESOURCES } from "@estoque-brasil/types"

// Zod schema for user creation form
export const createUserFormSchema = z.object({
  email: z
    .string({ required_error: "Email é obrigatório" })
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
  confirmPassword: z
    .string({ required_error: "Confirmação de senha é obrigatória" }),
  fullName: z
    .string({ required_error: "Nome completo é obrigatório" })
    .min(1, "Nome completo é obrigatório")
    .max(255, "Nome completo deve ter no máximo 255 caracteres"),
  phone: z
    .string()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  roleIds: z
    .array(z.string().uuid("ID de role inválido"))
    .min(1, "Pelo menos uma role é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export type CreateUserFormData = z.infer<typeof createUserFormSchema>

// Zod schema for user update form
export const updateUserFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .max(255, "Nome completo deve ter no máximo 255 caracteres")
    .optional(),
  phone: z
    .string()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
  roleIds: z
    .array(z.string().uuid("ID de role inválido"))
    .min(1, "Pelo menos uma role é obrigatória")
    .optional(),
})

export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>
