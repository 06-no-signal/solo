import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { DeepPartial } from 'typeorm/common/DeepPartial';
import { Unique } from 'typeorm';

@Entity('tenant')
@Unique(['host', 'database', 'port'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'connection_type', nullable: true })
  connectionType?: string;

  @Column({ name: 'username', nullable: true })
  username?: string;

  @Column({ name: 'password', nullable: true })
  password?: string;

  @Column({ name: 'host', nullable: true })
  host?: string;

  @Column({ name: 'database_name' })
  database: string;

  @Column({ nullable: true })
  port?: number;

  constructor(partial: DeepPartial<Tenant>) {
    Object.assign(this, partial);
  }
}
