import { 
    IsNotEmpty,
    IsEmail,
    MinLength,
    Matches,
    IsOptional,
    IsIn
} from 'class-validator';



export class ListerDTO {


    @IsNotEmpty()
    name?: string;



    @IsNotEmpty()
    @IsEmail()
    email?: string;



    @IsNotEmpty()
    @MinLength(6)
    password?: string;



    @IsNotEmpty()
    username?: string;



    @IsNotEmpty()
    fullName?: string;



    @IsNotEmpty()
    @Matches(/^[0-9]{10,13}$/, {
        message: "Invalid NID format"
    })
    nid?: string;



    @IsOptional()
    nidimage?: string;



    @IsOptional()
    @IsIn(['active','inactive'])
    status?: string;


}