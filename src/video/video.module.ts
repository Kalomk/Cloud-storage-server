import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [VideoService],
  controllers: [VideoController],
  imports: [JwtModule.register({})],
})
export class VideoModule {}
