import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './Admin/admin.module';
import { ListerModule } from './Pet_lister/pet_lister.module';
import { AdopterModule } from './Adopter/adopter.module';
import { VetModule } from './Vet/vet.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AdminModule,
        ListerModule,
        AdopterModule,
        VetModule,
        // database settings are read from .env
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get<string>("DB_HOST"),
                port: Number(configService.get<string>("DB_PORT")),
                username: configService.get<string>("DB_USERNAME"),
                password: configService.get<string>("DB_PASSWORD"),
                database: configService.get<string>("DB_NAME"),
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
    ],
    controllers: [
        AppController
    ],
    providers: [
        AppService
    ],
})
export class AppModule {}