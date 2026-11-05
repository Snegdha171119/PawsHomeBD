import {
    IsNotEmpty,
    IsOptional,
    IsInt,
    Min,
    Matches
} from "class-validator";
import { Type } from "class-transformer";

export class PetDTO {

    @IsNotEmpty()
    name?: string;

    @IsNotEmpty()
    species?: string;

    @IsOptional()
    breed?: string;

    // form-data sends everything as text, so turn age into a number first
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    age?: number;

    @IsNotEmpty()
    @Matches(/^(male|female)$/i, {
        message: "Gender must be male or female"
    })
    gender?: string;

    @IsOptional()
    description?: string;
}
