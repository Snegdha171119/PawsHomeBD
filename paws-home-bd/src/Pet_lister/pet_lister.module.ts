import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListerController } from "./pet_lister.controller";
import { ListerService } from "./pet_lister.service";
import { ListerEntity } from "./pet_lister.entity";
import { PetEntity } from "./pet.entity";
import { AuthModule } from "./Auth/auth.module";
import { AdopterEntity } from "../Adopter/adopter.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";


@Module({

    imports: [
        TypeOrmModule.forFeature([ListerEntity, AdopterEntity, PetEntity]),
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
        })
    ],

    controllers: [
        ListerController
    ],

    providers: [
        ListerService
    ]

})
export class ListerModule { }
