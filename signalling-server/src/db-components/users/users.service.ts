import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { User } from './users.entity';
import { DatabaseService } from 'src/libs/database/database.service';

@Injectable()
export class UsersService {
  private userRepository: Repository<User>;

  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(user: User, tenantId?: string): Promise<void> {
    this.userRepository = this.databaseService
      .getDataSource(tenantId)
      .getRepository(User);
    // chec if a user with the same keycloakId exists
    const existingUser = await this.userRepository.findOneBy({
      keycloakId: user.keycloakId,
    });
    console.log('existingUser', existingUser);
    if (existingUser) {
      const newUser = Object.assign(
        existingUser,
        Object.fromEntries(
          Object.entries(user).filter(([_, v]) => v != undefined && v != null),
        ),
      );
      // update the existing user
      await this.userRepository.save(newUser);
      return;
    }
    const newUser = this.userRepository.create(user);
    await this.userRepository.save(newUser);
  }

  async getUserByKeycloakId(
    keycloakId: string,
    tenantId?: string,
  ): Promise<User | null> {
    this.userRepository = this.databaseService
      .getDataSource(tenantId)
      .getRepository(User);
    return this.userRepository.findOneBy({ keycloakId });
  }

  async getUsers(tenantId?: string): Promise<User[]> {
    this.userRepository = this.databaseService
      .getDataSource(tenantId)
      .getRepository(User);
    return this.userRepository.find();
  }
}
