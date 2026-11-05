import { Module } from "@nestjs/common";
import { AdopterController } from "./adopter.controller";
import { AdopterService } from "./adopter.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdopterEntity } from "./adopter.entity";
import { AuthModule } from "./Auth/auth.module";
import { VetEntity } from "../Vet/vet.entity";
import { ListerEntity } from "../Pet_lister/pet_lister.entity";
import { PetEntity } from "../Pet_lister/pet.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import {ConfigModule,ConfigService} from "@nestjs/config";


@Module({
    imports: [TypeOrmModule.forFeature([AdopterEntity, VetEntity, ListerEntity, PetEntity]),
        AuthModule,
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
    controllers: [AdopterController],
    providers: [AdopterService]
})
export class AdopterModule { }
