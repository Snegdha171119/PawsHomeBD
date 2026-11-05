import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminEntity } from "./admin.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "./Auth/auth.module";
import { ListerEntity } from "../Pet_lister/pet_lister.entity";
import { AdminProfileEntity } from "./admin_profile.entity";
import { PetEntity } from "../Pet_lister/pet.entity";
import { VetEntity } from "../Vet/vet.entity";
import { AdopterEntity } from "../Adopter/adopter.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({

    imports: [
        TypeOrmModule.forFeature([AdminEntity, ListerEntity, AdminProfileEntity, PetEntity, VetEntity, AdopterEntity]),
        AuthModule,
        // mail settings come from .env now (same as the other modules)
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get<string>("MAIL_HOST"),
                    port: Number(configService.get<string>("MAIL_PORT")),
                    secure: true,
                    auth: {
                        user: configService.get<string>("MAIL_USER"),
                        pass: configService.get<string>("MAIL_PASS")
                    }
                },
                defaults: {
                    from: `"PawsHome BD" <${configService.get<string>("MAIL_USER")}>`
                }
            })
        })],
    controllers: [
        AdminController
    ],

    providers: [
        AdminService
    ]

})
export class AdminModule { }
