import { AccessResource } from '../../../domain/entities/AccessResource.js';
import { AccessAction } from '../../../domain/entities/AccessAction.js';
import { AccessPolicy } from '../../../domain/entities/AccessPolicy.js';
import { toPermissionResponse } from '../users/UserResponseDTO.js';

export interface AccessResourceResponseDTO {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  icon: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccessActionResponseDTO {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccessPolicyResponseDTO {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  icon: string | null;
  isSystemPolicy: boolean;
  permissions: Array<{ id: string; resource: string; action: string; description: string | null }>;
  createdAt: string;
  updatedAt: string;
}

export function toAccessResourceResponse(resource: AccessResource): AccessResourceResponseDTO {
  return {
    id: resource.id!,
    name: resource.name,
    displayName: resource.displayName,
    description: resource.description,
    icon: resource.icon,
    isSystem: resource.isSystem,
    sortOrder: resource.sortOrder,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

export function toAccessActionResponse(action: AccessAction): AccessActionResponseDTO {
  return {
    id: action.id!,
    name: action.name,
    displayName: action.displayName,
    description: action.description,
    isSystem: action.isSystem,
    sortOrder: action.sortOrder,
    createdAt: action.createdAt.toISOString(),
    updatedAt: action.updatedAt.toISOString(),
  };
}

export function toAccessPolicyResponse(policy: AccessPolicy): AccessPolicyResponseDTO {
  return {
    id: policy.id!,
    name: policy.name,
    displayName: policy.displayName,
    description: policy.description,
    icon: policy.icon,
    isSystemPolicy: policy.isSystemPolicy,
    permissions: policy.permissions.map(toPermissionResponse),
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString(),
  };
}
