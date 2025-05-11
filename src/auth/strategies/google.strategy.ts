import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('security.google.clientId'),
      clientSecret: configService.get<string>('security.google.clientSecret'),
      callbackURL: configService.get<string>('security.google.callbackURL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = await this.usersService.createGoogleUser(profile);
    const tokens = await this.authService.generateTokens(user);
    await this.authService.updateUserRefreshToken(user, tokens.refreshToken);

    done(null, { user, ...tokens });
  }
} 