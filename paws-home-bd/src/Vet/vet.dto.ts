import {
    IsNotEmpty,
    IsEmail,
    MinLength,
    IsOptional,
    IsIn,
    Matches
} from "class-validator";


export class VetForm {


    @IsNotEmpty()
    name?: string;



    @IsNotEmpty()
    @IsEmail()
    email?: string;



    @IsNotEmpty()
    @MinLength(6)
    password?: string;



    // phone stays a string so the leading 0 is kept
    @IsNotEmpty()
    @Matches(/^01[0-9]{9}$/, {
        message: "Phone must be 11 digits and start with 01"
    })
    phone?: string;



    @IsNotEmpty()
    fullName?: string;



    @IsOptional()
    @IsIn(['active','inactive'])
    status?: string;


}