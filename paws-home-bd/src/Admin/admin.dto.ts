import {
    IsNotEmpty,
    MinLength,
    Matches,
    IsInt,
    Min,
    IsOptional,
    IsEmail
} from "class-validator";

export class AdminForm {

    @IsNotEmpty()
    fullName?: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @Matches(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: 'Email cannot contain uppercase letters',
    })
    email?: string;

    @IsNotEmpty()
    @MinLength(6)
    @Matches(/^(?=.*[A-Z])/, {
        message: "Password must contain at least one Uppercase character"
    })
    password?: string;

    @IsNotEmpty()
    @Matches(/^(male|female)$/i, {
        message: "Gender must be male or female"
    })
    gender?: string;

    @IsNotEmpty()
    @Matches(/^[0-9]+$/, {
        message: "Phone number must contain only numbers"
    })
    phone?: string;

    @IsOptional()
    @IsInt()
    @Min(18)
    age?: number;

    @IsOptional()
    @Matches(/^(active|inactive)$/, {
        message: "Status must be active or inactive"
    })
    status?: string;
}