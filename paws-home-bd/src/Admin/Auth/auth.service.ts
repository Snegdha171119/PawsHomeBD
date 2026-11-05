import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { AdminEntity } from "../admin.entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AdminEntity)
        private adminRepository: Repository<AdminEntity>,
        private jwtService: JwtService,
    ) { }

    async validateAdmin(email: string, password: string) {
        const admin = await this.adminRepository.findOneBy({
            email: email,
        });

        if (!admin) {
            throw new UnauthorizedException("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            throw new UnauthorizedException("Invalid password");
        }

        return admin;
    }

    async login(email: string, password: string) {
        const admin = await this.validateAdmin(email, password);

        const payload = {
            email: admin.email,
            id: admin.id,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}