import { Entity, Column, BeforeInsert, BeforeUpdate, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('users')
export class User extends BaseEntity {
  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({ nullable: true })
  providerId: string | null;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ nullable: true })
  avatar: string | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string | null;

  @Column({ nullable: true })
  emailVerificationTokenExpires: Date | null;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string | null;

  @Column({ nullable: true })
  @Exclude()
  refreshTokenExpires: Date | null;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || this.email;
  }
} 