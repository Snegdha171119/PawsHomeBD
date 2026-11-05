import {IsNotEmpty, IsOptional, IsString} from "class-validator";


export class AdminProfileDTO {

    @IsNotEmpty()
    @IsString()
    address!: string;


    @IsNotEmpty()
    @IsString()
    designation!: string;


    @IsOptional()
    @IsString()
    bio?: string;


    @IsNotEmpty()
    @IsString()
    qualification?: string;
}