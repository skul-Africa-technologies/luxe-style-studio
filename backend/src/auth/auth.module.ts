import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { Admin, AdminSchema } from './entities/admin.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * AuthModule - Handles authentication for admin users
 * Provides JWT-based authentication for admin login
 */
@Module({
  imports: [
    // Register Admin schema with Mongoose
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
    ]),
    // Configure JWT module with secret from environment
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        signOptions: {
          expiresIn: process.env.JWT_EXPIRATION || '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
