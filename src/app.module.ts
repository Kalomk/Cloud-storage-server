import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from './files/files.module';
import { UserEntity } from './users/entities/user.entity';
import { FileEntity } from './files/entities/file.entity';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { FfmpegModule } from './ffmpeg/ffmpeg.module';
import { VideoModule } from './video/video.module';
import { SharpModule } from './sharp/sharp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register({
      dest: './uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_USERNAME,
      entities: [UserEntity, FileEntity],
      synchronize: true,
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    FfmpegModule,
    SharpModule,
    VideoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
