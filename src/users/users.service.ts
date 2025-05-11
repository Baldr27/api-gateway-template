import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AuthProvider } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async createGoogleUser(profile: any): Promise<User> {
    const existingUser = await this.findByEmail(profile.emails[0].value);
    if (existingUser) {
      if (existingUser.provider === AuthProvider.GOOGLE) {
        return existingUser;
      }
      // If user exists with local auth, update to Google auth
      existingUser.provider = AuthProvider.GOOGLE;
      existingUser.providerId = profile.id;
      existingUser.isEmailVerified = true;
      return this.usersRepository.save(existingUser);
    }

    const user = this.usersRepository.create({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      avatar: profile.photos?.[0]?.value,
      provider: AuthProvider.GOOGLE,
      providerId: profile.id,
      isEmailVerified: true,
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  async generateEmailVerificationToken(user: User): Promise<User> {
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    user.emailVerificationToken = token;
    user.emailVerificationTokenExpires = expires;
    return this.usersRepository.save(user);
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (user.emailVerificationTokenExpires < new Date()) {
      throw new ConflictException('Verification token has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    return this.usersRepository.save(user);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    expiresIn: number,
  ): Promise<void> {
    const user = await this.findOne(userId);
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + expiresIn);

    user.refreshToken = refreshToken;
    user.refreshTokenExpires = refreshToken ? expires : null;
    await this.usersRepository.save(user);
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        refreshToken: token,
        refreshTokenExpires: MoreThan(new Date()),
      },
    });
  }
} 