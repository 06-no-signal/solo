import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import type { DeepPartial } from 'typeorm/common/DeepPartial';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  keycloakId: string;

  constructor(partial: DeepPartial<User>) {
    Object.assign(this, partial);
  }
}
