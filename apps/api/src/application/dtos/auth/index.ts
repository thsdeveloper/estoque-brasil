export * from './RegisterDTO.js';
export * from './LoginDTO.js';
export * from './ForgotPasswordDTO.js';
export * from './ResetPasswordDTO.js';
export * from './UpdatePasswordDTO.js';

export interface UserResponseDTO {
  id: string;
  email: string;
  emailConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
