import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import type { DeepPartial } from 'typeorm/common/DeepPartial';

@Entity('users')
@Unique(['keycloakId'])
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  username?: string;

  @Column()
  keycloakId: string;

  constructor(partial: DeepPartial<User>) {
    Object.assign(this, partial);
  }
}
