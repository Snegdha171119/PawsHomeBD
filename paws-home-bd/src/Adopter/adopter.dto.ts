import {
    IsNotEmpty,
    IsEmail,
    MinLength,
    Matches,
    IsOptional,
    IsIn
} from "class-validator";



export class AdopterDTO {


    @IsNotEmpty()
    name?: string;



    @IsNotEmpty()
    @IsEmail()
    email?: string;



    @IsNotEmpty()
    @MinLength(6)
    password?: string;



    @IsNotEmpty()
    @Matches(/^01[0-9]+$/, {
        message:"Phone number must start with 01"
    })
    phone?: string;



    @IsOptional()
    @IsIn(['active','inactive'])
    status?: string;


}