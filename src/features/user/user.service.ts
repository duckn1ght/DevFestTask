import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'orgName', 'fullname'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update({ id }, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.usersRepository.delete({ id });
    return { deleted: true };
  }
}
