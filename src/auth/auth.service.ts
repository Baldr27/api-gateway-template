import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, TokenResponseDto } from './dto/auth-response.dto';
import { User } from '../users/entities/user.entity';
import { AuthProvider } from '../users/entities/user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.provider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.generateTokens(user);
    await this.updateUserRefreshToken(user, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    const user = await this.usersService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.updateUserRefreshToken(user, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null, 0);
  }

  async generateTokens(user: User): Promise<TokenResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('security.jwt.secret'),
          expiresIn: this.configService.get<string>('security.jwt.expiresIn'),
        },
      ),
      this.generateRefreshToken(),
    ]);

    const expiresIn = this.getTokenExpirationInSeconds(
      this.configService.get<string>('security.jwt.expiresIn'),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async generateRefreshToken(): Promise<string> {
    return randomBytes(40).toString('hex');
  }

  private async updateUserRefreshToken(
    user: User,
    refreshToken: string,
  ): Promise<void> {
    const expiresIn = this.getTokenExpirationInSeconds(
      this.configService.get<string>('security.jwt.refreshExpiresIn'),
    );
    await this.usersService.updateRefreshToken(user.id, refreshToken, expiresIn);
  }

  private getTokenExpirationInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default to 1 hour
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 's':
        return numValue;
      case 'm':
        return numValue * 60;
      case 'h':
        return numValue * 3600;
      case 'd':
        return numValue * 86400;
      default:
        return 3600;
    }
  }
} 