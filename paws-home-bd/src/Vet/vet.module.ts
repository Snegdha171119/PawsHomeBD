import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { VetController } from "./vet.controller";
import { VetService } from "./vet.service";
import { VetEntity } from "./vet.entity";
import { AuthModule } from "./Auth/auth.module";
import { AdopterEntity } from "../Adopter/adopter.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import {ConfigModule,ConfigService} from "@nestjs/config";



@Module({

    imports:[
        TypeOrmModule.forFeature([VetEntity,AdopterEntity]),
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

    controllers:[
        VetController
    ],

    providers:[
        VetService
    ]

})
export class VetModule {}