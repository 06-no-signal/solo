import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: CreateUserDto) {
    console.log('request', request);
    return this.usersService.createUser(
      new User({
        email: request.email,
        keycloakId: request.keycloakId,
      }),
    );
  }

  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }
}
