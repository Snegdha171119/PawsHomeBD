import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { ListerDTO } from "./pet_lister.dto";
import { ListerEntity } from "./pet_lister.entity";
import { AdopterEntity } from "../Adopter/adopter.entity";
import { PetEntity } from "./pet.entity";
import { PetDTO } from "./pet.dto";
import {
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import Pusher from "pusher";
import * as bcrypt from "bcrypt";
import * as fs from "fs";

// Columns we send back for a lister (never send the password hash)
const listerColumns = {
    id: true,
    username: true,
    fullName: true,
    name: true,
    email: true,
    nid: true,
    status: true,
    profileImage: true,
};


@Injectable()
export class ListerService {

    private pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true,
    });

    constructor(

        @InjectRepository(ListerEntity)
        private listerRepository: Repository<ListerEntity>,

        @InjectRepository(AdopterEntity)
        private adopterRepository: Repository<AdopterEntity>,

        @InjectRepository(PetEntity)
        private petRepository: Repository<PetEntity>,

        private readonly mailerService: MailerService

    ) { }

    async sendWelcomeEmail(
        email: string,
        name: string
    ): Promise<object> {

        try {

            await this.mailerService.sendMail({
                to: email,
                from: process.env.MAIL_USER,
                subject: "Welcome Pet Lister - PawsHome BD",
                text:
                    `Hello ${name}, welcome to PawsHome BD. ` +
                    `Your Pet Lister account has been created successfully.`
            });

            return {
                message: "Lister welcome email sent successfully",
                receiver: email
            };

        } catch (error) {

            console.error(
                "LISTER MAILER ERROR:",
                error
            );

            throw new HttpException(
                "Lister welcome email could not be sent",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ---------- Lister - Adopter relation ----------

    async assignAdopter(
        listerId: number,
        adopterId: number
    ) {

        const lister = await this.listerRepository.findOneBy({
            id: listerId
        });

        const adopter = await this.adopterRepository.findOneBy({
            id: adopterId
        });

        if (!lister || !adopter) {
            throw new NotFoundException(
                "Lister or Adopter not found"
            );
        }

        adopter.lister = lister;
        await this.adopterRepository.save(adopter);

        return {
            message: "Adopter assigned to lister successfully"
        };
    }

    async getListerAdopters(
        listerId: number
    ) {

        const lister = await this.listerRepository.findOneBy({
            id: listerId
        });

        if (!lister) {
            throw new NotFoundException(
                "Lister not found"
            );
        }

        // only the safe adopter columns
        return this.adopterRepository.find({
            where: {
                lister: { id: listerId }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true
            }
        });
    }

    async removeAdopter(
        adopterId: number
    ) {

        const adopter = await this.adopterRepository.findOneBy({
            id: adopterId
        });

        if (!adopter) {
            throw new NotFoundException(
                "Adopter not found"
            );
        }

        adopter.lister = null as any;
        await this.adopterRepository.save(adopter);

        return {
            message: "Adopter removed from lister successfully"
        };
    }

    // ---------- Lister CRUD ----------

    getLister(): string {
        return "Lister Module: PawsHome BD";
    }

    async getAllListers(): Promise<ListerEntity[]> {
        return this.listerRepository.find({
            select: listerColumns
        });
    }

    async getListerByID(id: number): Promise<ListerEntity> {
        const lister = await this.listerRepository.findOne({
            where: { id: id },
            select: listerColumns
        });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        return lister;
    }

    async createLister(
        mydto: ListerDTO
    ): Promise<object> {

        // email and username both have to be unique
        const existingEmail = await this.listerRepository.findOneBy({ email: mydto.email! });

        if (existingEmail) {
            throw new ConflictException("Lister with this email already exists");
        }

        const existingUsername = await this.listerRepository.findOneBy({ username: mydto.username! });

        if (existingUsername) {
            throw new ConflictException("Username already exists");
        }

        mydto.password = await bcrypt.hash(mydto.password!, 10);

        const lister = this.listerRepository.create(mydto);
        const savedLister = await this.listerRepository.save(lister);

        // realtime notification for the lister dashboard
        await this.pusher.trigger(
            "lister-channel",
            "new-lister",
            {
                message: "A new pet lister has registered",
                name: savedLister.fullName,
            }
        );

        return {
            message: "Lister registered successfully",
            id: savedLister.id,
        };
    }

    async updateLister(id: number, mydto: ListerDTO): Promise<ListerEntity> {
        const lister = await this.listerRepository.findOneBy({ id: id });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        // Hash only when a new password is provided
        if (mydto.password) {
            mydto.password = await bcrypt.hash(mydto.password, 10);
        }

        await this.listerRepository.update(id, mydto);

        return this.getListerByID(id);
    }

    async changeStatus(id: number, status: string): Promise<ListerEntity> {
        const lister = await this.listerRepository.findOneBy({ id: id });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        if (status !== "active" && status !== "inactive") {
            throw new BadRequestException("Status must be active or inactive");
        }

        await this.listerRepository.update(id, { status: status });

        return this.getListerByID(id);
    }

    // the database deletes the pets (CASCADE), here we delete their photo files too
    async deleteListerFiles(lister: ListerEntity) {
        const pets = await this.petRepository.find({
            where: { lister: { id: lister.id } }
        });

        pets.forEach((pet) => {
            if (pet.image) {
                fs.unlink("./uploads/" + pet.image, () => { });
            }
        });

        if (lister.profileImage) {
            fs.unlink("./uploads/" + lister.profileImage, () => { });
        }
    }

    async removeLister(id: number): Promise<object> {
        const lister = await this.listerRepository.findOneBy({ id: id });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        await this.deleteListerFiles(lister);
        await this.listerRepository.delete(id);

        return {
            message: "Lister deleted successfully"
        };
    }

    // save the new profile photo name and delete the old file
    async uploadPhoto(id: number, image: string): Promise<object> {
        const lister = await this.listerRepository.findOneBy({ id: id });

        if (!lister) {
            fs.unlink("./uploads/" + image, () => { });
            throw new NotFoundException("Lister not found");
        }

        if (lister.profileImage) {
            fs.unlink("./uploads/" + lister.profileImage, () => { });
        }

        await this.listerRepository.update(id, { profileImage: image });

        return {
            message: "Profile photo updated successfully",
            profileImage: image
        };
    }

    // ---------- Search ----------

    // ILike() gives a partial match that ignores upper/lower case, e.g. "rah" finds "Rahim Uddin"
    async searchByFullName(name: string): Promise<ListerEntity[]> {
        return this.listerRepository.find({
            where: { fullName: ILike(`%${name}%`) },
            select: listerColumns
        });
    }

    async getListerByUsername(username: string): Promise<ListerEntity> {
        const lister = await this.listerRepository.findOne({
            where: { username: username },
            select: listerColumns
        });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        return lister;
    }

    async removeListerByUsername(username: string): Promise<object> {
        const lister = await this.listerRepository.findOneBy({ username: username });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        await this.deleteListerFiles(lister);
        await this.listerRepository.delete({ username: username });

        return {
            message: "Lister deleted successfully"
        };
    }

    // ---------- Pets ----------

    // listerId comes from the JWT, so a lister can only add pets to their own account
    async addPet(listerId: number, mydto: PetDTO, image: string): Promise<object> {
        const lister = await this.listerRepository.findOneBy({ id: listerId });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        const pet = this.petRepository.create({
            ...mydto,
            image: image,
            lister: lister,
        });

        const savedPet = await this.petRepository.save(pet);

        // let the admin know a new pet is waiting for approval
        await this.pusher.trigger(
            "admin-channel",
            "new-pet",
            {
                message: "A new pet is waiting for approval",
                name: savedPet.name,
            }
        );

        return {
            message: "Pet added successfully, waiting for admin approval",
            id: savedPet.id
        };
    }

    async getMyPets(listerId: number): Promise<PetEntity[]> {
        return this.petRepository.find({
            where: {
                lister: { id: listerId }
            },
            order: { id: "DESC" }
        });
    }

    async removePet(listerId: number, petId: number): Promise<object> {
        const pet = await this.petRepository.findOne({
            where: {
                id: petId,
                lister: { id: listerId }
            }
        });

        if (!pet) {
            throw new NotFoundException("Pet not found");
        }

        await this.petRepository.delete(petId);

        // also remove the photo from the uploads folder
        if (pet.image) {
            fs.unlink("./uploads/" + pet.image, () => { });
        }

        return {
            message: "Pet removed successfully"
        };
    }
}
