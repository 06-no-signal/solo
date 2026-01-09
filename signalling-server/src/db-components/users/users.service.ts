import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { User } from './users.entity';
import { DatabaseService } from 'src/libs/database/database.service';

@Injectable()
export class UsersService {
  private userRepository: Repository<User>;

  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(user: User) {
    this.userRepository = this.databaseService
      .getDataSource()
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

  async getUsers(): Promise<User[]> {
    this.userRepository = this.databaseService
      .getDataSource()
      .getRepository(User);
    return this.userRepository.find();
  }
}
