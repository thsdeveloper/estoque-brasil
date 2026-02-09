import { Setor } from '../entities/Setor.js';

export interface ISetorRepository {
  create(setor: Setor): Promise<Setor>;
  findById(id: number): Promise<Setor | null>;
  findByInventario(idInventario: number): Promise<Setor[]>;
  update(setor: Setor): Promise<Setor>;
  delete(id: number): Promise<void>;
  deleteByInventario(idInventario: number): Promise<void>;
  findByUsuarioEmContagem(userId: string, idInventario: number): Promise<Setor | null>;
  findNextPendenteByOrder(idInventario: number): Promise<Setor | null>;
  findByInventarioWithStatus(idInventario: number): Promise<Setor[]>;
}
