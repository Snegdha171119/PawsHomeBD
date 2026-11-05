import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { ListerEntity } from "../pet_lister.entity";


@Injectable()
export class AuthService {


    constructor(

        @InjectRepository(ListerEntity)
        private listerRepository: Repository<ListerEntity>,


        private jwtService: JwtService

    ) {}



    async validateLister(
        email:string,
        password:string
    ){


        const lister = await this.listerRepository.findOneBy({
            email:email
        });



        if(!lister){

            throw new UnauthorizedException(
                "Lister not found"
            );

        }



        const isMatch = await bcrypt.compare(
            password,
            lister.password
        );



        if(!isMatch){

            throw new UnauthorizedException(
                "Invalid password"
            );

        }



        return lister;

    }





    async login(
        email:string,
        password:string
    ){


        const lister = await this.validateLister(
            email,
            password
        );



        const payload = {

            id:lister.id,

            email:lister.email

        };



        return {

            access_token:this.jwtService.sign(payload)

        };


    }


}