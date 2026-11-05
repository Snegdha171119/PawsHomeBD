import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { jwtConstants } from "./constants";

import { VetEntity } from "../vet.entity";
import { JwtStrategy } from "./jwt.strategy";


@Module({

    imports:[

        TypeOrmModule.forFeature([VetEntity]),

        PassportModule,

        JwtModule.register({

            secret:jwtConstants.secret,

            signOptions:{
                expiresIn:'1h'
            }

        })

    ],


    controllers:[
        AuthController
    ],


    providers:[
        AuthService,
        JwtStrategy
    ],


    exports:[
        AuthService
    ]

})
export class AuthModule {}