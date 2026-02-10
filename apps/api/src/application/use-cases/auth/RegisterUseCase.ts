import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { User } from '../../../domain/entities/User.js';
import { RegisterDTO, RegisterResponseDTO } from '../../dtos/auth/RegisterDTO.js';
import { cpfToEmail, stripCpf, isValidCpf } from '../../../domain/validators/cpf.js';
import { UserAlreadyExistsError } from '../../../domain/errors/AuthErrors.js';

export class RegisterUseCase {
  constructor(
    private authService: SupabaseAuthService,
    private userRepository: IUserRepository,
  ) {}

  async execute(data: RegisterDTO): Promise<RegisterResponseDTO> {
    const cpf = stripCpf(data.cpf);

    if (!isValidCpf(cpf)) {
      throw new Error('CPF inválido');
    }

    // Check if CPF already exists
    const exists = await this.userRepository.existsByCpf(cpf);
    if (exists) {
      throw new UserAlreadyExistsError();
    }

    const email = cpfToEmail(cpf);

    // Create auth user (admin method, auto-confirms)
    const authUserId = await this.authService.createUser(email, data.password);

    // Create user profile
    const user = User.create({
      id: authUserId,
      email,
      fullName: data.fullName,
      cpf,
    });

    await this.userRepository.create(user);

    return {
      message: 'Conta criada com sucesso.',
      cpf,
    };
  }
}
