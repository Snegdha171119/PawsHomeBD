import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { VetEntity } from "../vet.entity";


@Injectable()
export class AuthService {


    constructor(

        @InjectRepository(VetEntity)
        private vetRepository: Repository<VetEntity>,


        private jwtService: JwtService

    ) {}



    async validateVet(
        email:string,
        password:string
    ){


        const vet = await this.vetRepository.findOneBy({
            email:email
        });



        if(!vet){

            throw new UnauthorizedException(
                "Vet not found"
            );

        }



        const isMatch = await bcrypt.compare(
            password,
            vet.password
        );



        if(!isMatch){

            throw new UnauthorizedException(
                "Invalid password"
            );

        }



        return vet;

    }




    async login(
        email:string,
        password:string
    ){


        const vet = await this.validateVet(
            email,
            password
        );



        const payload = {

            id:vet.id,

            email:vet.email

        };



        return {

            access_token:this.jwtService.sign(payload)

        };


    }


}