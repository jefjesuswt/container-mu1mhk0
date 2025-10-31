import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Request,
  Put,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StorageService } from '../storage/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import { UpdateMyInfoDto } from './dto/update-my-info.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly storageService: StorageService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/create')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put('/me/picture')
  @UseInterceptors(FileInterceptor('profileImage')) // Matches frontend field name
  @UseInterceptors(ClassSerializerInterceptor)
  async uploadProfilePicture(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<User> {
    const userId = req.user._id;
    const updatedUser = await this.usersService.updateProfilePicture(
      userId.toString(),
      file,
    );

    return updatedUser;
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch('/me')
  @UseInterceptors(ClassSerializerInterceptor)
  async updateMyInfo(
    @Request() req: Request,
    @Body() updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<User> {
    const userId = req['user']._id;
    return this.usersService.updateMyInfo(userId.toString(), updateMyInfoDto);
  }

  @Patch('/superadmin/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete('/superadmin/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
