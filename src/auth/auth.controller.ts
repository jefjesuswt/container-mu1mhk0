import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendConfirmationDto } from './dto/resend-confirmation.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { Public } from './decorators/public.decorator';

@UseGuards(AuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @UseInterceptors(ClassSerializerInterceptor)
  login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post('/register')
  @UseInterceptors(ClassSerializerInterceptor)
  register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    return this.authService.register(registerUserDto);
  }

  @Get('/checkToken')
  @UseInterceptors(ClassSerializerInterceptor)
  checkToken(@Request() req: Request): Promise<AuthResponseDto> {
    const user = req['user'];
    return this.authService.checkToken(user);
  }

  @Public()
  @Get('/confirm-email')
  @UseInterceptors(ClassSerializerInterceptor)
  async confirmEmail(@Query('token') token: string): Promise<AuthResponseDto> {
    return await this.authService.confirmEmail(token);
  }

  @Public()
  @Post('resend-confirmation')
  @HttpCode(HttpStatus.OK)
  async resendConfirmation(
    @Body() resendConfirmationDto: ResendConfirmationDto,
  ) {
    await this.authService.resendConfirmationEmail(resendConfirmationDto.email);
    return {
      message:
        'Si una cuenta con ese correo existe, se ha enviado un correo de confirmación.',
    };
  }

  @Public()
  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.sendPasswordResetEmail(forgotPasswordDto);
    return {
      message:
        'Se ha enviado un correo de recuperación de contraseña a la dirección proporcionada.',
    };
  }

  @Public()
  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(
    @Body() verifyCodeDto: VerifyCodeDto,
  ): Promise<{ valid: boolean }> {
    const isValid = await this.authService.verifyResetCode(verifyCodeDto);

    return { valid: isValid };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req['user'];
    return this.authService.changePassword(user.email, changePasswordDto);
  }
}
