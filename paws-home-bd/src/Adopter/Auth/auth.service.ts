import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { AdopterEntity } from "../adopter.entity";


@Injectable()
export class AuthService {


    constructor(

        @InjectRepository(AdopterEntity)
        private adopterRepository: Repository<AdopterEntity>,


        private jwtService: JwtService

    ) {}



    async validateAdopter(
        email:string,
        password:string
    ){


        const adopter = await this.adopterRepository.findOneBy({
            email:email
        });



        if(!adopter){

            throw new UnauthorizedException(
                "Adopter not found"
            );

        }



        const isMatch = await bcrypt.compare(
            password,
            adopter.password
        );



        if(!isMatch){

            throw new UnauthorizedException(
                "Invalid password"
            );

        }



        return adopter;

    }




    async login(
        email:string,
        password:string
    ){


        const adopter = await this.validateAdopter(
            email,
            password
        );



        const payload = {

            id:adopter.id,

            email:adopter.email

        };



        return {

            access_token:this.jwtService.sign(payload)

        };


    }


}