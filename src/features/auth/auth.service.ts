import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwtPayload';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async register(registerDto: RegisterDto) {
		const existing = await this.userService.findByEmail(registerDto.email);
		if (existing) {
			throw new BadRequestException('Email already in use');
		}

		const hashedPassword = await bcrypt.hash(registerDto.password, 10);
		const user = await this.userService.create({
			...registerDto,
			password: hashedPassword,
		});

		return this.buildAuthResponse(user);
	}

	async login(loginDto: LoginDto) {
		const user = await this.userService.findByEmailWithPassword(loginDto.email);

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const passwordValid = await bcrypt.compare(loginDto.password, user.password);

		if (!passwordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const { password, ...safeUser } = user;
		return this.buildAuthResponse(safeUser as User);
	}

	async me(userId: string) {
		const user = await this.userService.findOne(userId);

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		return user;
	}

	private buildAuthResponse(user: User) {
		return {
			accessToken: this.signToken(user),
			user: {
				id: user.id,
				email: user.email,
				orgName: user.orgName,
				fullname: user.fullname,
			},
		};
	}

	private signToken(user: User) {
		const payload: JwtPayload = { sub: user.id, email: user.email };
		return this.jwtService.sign(payload);
	}
}
