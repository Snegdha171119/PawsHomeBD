import { Injectable, NotFoundException, ConflictException, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdopterDTO } from "./adopter.dto";
import { AdopterEntity } from "./adopter.entity";
import { VetEntity } from "../Vet/vet.entity";
import { ListerEntity } from "../Pet_lister/pet_lister.entity";
import { PetEntity } from "../Pet_lister/pet.entity";
import { MailerService } from "@nestjs-modules/mailer";
import Pusher from "pusher";
import * as bcrypt from "bcrypt";
import * as fs from "fs";

// Columns we send back for an adopter (never send the password hash)
const adopterColumns = {
    id: true,
    name: true,
    email: true,
    phone: true,
    status: true,
    profileImage: true,
};


@Injectable()
export class AdopterService {

    private pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true,
    });

    constructor(

        @InjectRepository(AdopterEntity)
        private adopterRepository: Repository<AdopterEntity>,

        private readonly mailerService: MailerService,

        @InjectRepository(VetEntity)
        private vetRepository: Repository<VetEntity>,

        @InjectRepository(ListerEntity)
        private listerRepository: Repository<ListerEntity>,

        @InjectRepository(PetEntity)
        private petRepository: Repository<PetEntity>

    ) { }

    async sendWelcomeEmail(
        email: string,
        name: string
    ): Promise<object> {

        try {

            await this.mailerService.sendMail({
                to: email,
                from: process.env.MAIL_USER,
                subject: "Welcome Adopter - PawsHome BD",
                text:
                    `Hello ${name}, welcome to PawsHome BD. ` +
                    `Your Adopter account has been created successfully.`
            });

            return {
                message: "Adopter welcome email sent successfully",
                receiver: email
            };

        } catch (error) {

            console.error(
                "ADOPTER MAILER ERROR:",
                error
            );

            throw new HttpException(
                "Adopter welcome email could not be sent",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ---------- Adopter - Vet relation ----------

    async assignVet(
        adopterId: number,
        vetId: number
    ) {

        const adopter = await this.adopterRepository.findOneBy({
            id: adopterId
        });

        const vet = await this.vetRepository.findOneBy({
            id: vetId
        });

        if (!adopter || !vet) {
            throw new NotFoundException(
                "Adopter or Vet not found"
            );
        }

        adopter.vet = vet;
        await this.adopterRepository.save(adopter);

        return {
            message: "Vet assigned successfully"
        };
    }

    async getAdopterVet(
        adopterId: number
    ) {

        const adopter = await this.adopterRepository.findOne({
            where: {
                id: adopterId
            },
            relations: {
                vet: true
            }
        });

        if (!adopter) {
            throw new NotFoundException(
                "Adopter not found"
            );
        }

        if (!adopter.vet) {
            throw new NotFoundException(
                "No vet assigned to this adopter"
            );
        }

        // hide the vet password before sending
        const { password, ...vet } = adopter.vet;

        return vet;
    }

    async removeVet(
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

        adopter.vet = null as any;
        await this.adopterRepository.save(adopter);

        return {
            message: "Vet removed successfully"
        };
    }

    // ---------- Adopter - Lister relation ----------

    async assignLister(
        adopterId: number,
        listerId: number
    ) {

        const adopter = await this.adopterRepository.findOneBy({
            id: adopterId
        });

        const lister = await this.listerRepository.findOneBy({
            id: listerId
        });

        if (!adopter || !lister) {
            throw new NotFoundException(
                "Adopter or Lister not found"
            );
        }

        adopter.lister = lister;
        await this.adopterRepository.save(adopter);

        return {
            message: "Lister assigned successfully"
        };
    }

    async getAdopterLister(
        adopterId: number
    ) {

        const adopter = await this.adopterRepository.findOne({
            where: {
                id: adopterId
            },
            relations: {
                lister: true
            }
        });

        if (!adopter) {
            throw new NotFoundException(
                "Adopter not found"
            );
        }

        if (!adopter.lister) {
            throw new NotFoundException(
                "No lister assigned to this adopter"
            );
        }

        // hide the lister password before sending
        const { password, ...lister } = adopter.lister;

        return lister;
    }

    async removeLister(
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
            message: "Lister removed successfully"
        };
    }

    // ---------- Pets ----------

    // adopters only see pets the admin has approved
    async getAvailablePets(): Promise<PetEntity[]> {
        return this.petRepository.find({
            where: { status: "approved" },
            order: { id: "DESC" }
        });
    }

    // ---------- Adopter CRUD ----------

    getAdopter(): string {
        return "Adopter Module - PawsHome BD";
    }

    async getAllAdopters(): Promise<AdopterEntity[]> {
        return this.adopterRepository.find({
            select: adopterColumns
        });
    }

    async getAdopterByID(id: number): Promise<AdopterEntity> {

        const adopter = await this.adopterRepository.findOne({
            where: { id: id },
            select: adopterColumns
        });

        if (!adopter) {
            throw new NotFoundException(
                "Adopter not found"
            );
        }

        return adopter;
    }

    async createAdopter(mydto: AdopterDTO): Promise<object> {

        const existingAdopter = await this.adopterRepository.findOneBy({ email: mydto.email! });

        if (existingAdopter) {
            throw new ConflictException("Adopter with this email already exists");
        }

        mydto.password = await bcrypt.hash(
            mydto.password!,
            10
        );

        const adopter = this.adopterRepository.create(mydto);
        const savedAdopter = await this.adopterRepository.save(adopter);

        // realtime notification for the adopter dashboard
        await this.pusher.trigger(
            "adopter-channel",
            "new-adopter",
            {
                message: "A new adopter has joined",
                name: savedAdopter.name,
            }
        );

        return {
            message: "Adopter registered successfully",
            id: savedAdopter.id
        };
    }

    async updateAdopter(
        id: number,
        mydto: AdopterDTO
    ): Promise<AdopterEntity> {

        const adopter = await this.adopterRepository.findOneBy({
            id: id
        });

        if (!adopter) {
            throw new NotFoundException(
                "Adopter not found"
            );
        }

        // Hash only when a new password is provided
        if (mydto.password) {
            mydto.password = await bcrypt.hash(mydto.password, 10);
        }

        await this.adopterRepository.update(
            id,
            mydto
        );

        return this.getAdopterByID(id);
    }

    async changeStatus(
        id: number,
        status: string
    ): Promise<AdopterEntity> {

        const adopter = await this.adopterRepository.findOneBy({
            id: id
        });

        if (!adopter) {
            throw new NotFoundException(
                "Adopter not found"
            );
        }

        if (status !== "active" && status !== "inactive") {
            throw new BadRequestException("Status must be active or inactive");
        }

        await this.adopterRepository.update(
            id,
            {
                status: status
            }
        );

        return this.getAdopterByID(id);
    }

    // save the new profile photo name and delete the old file
    async uploadPhoto(id: number, image: string): Promise<object> {

        const adopter = await this.adopterRepository.findOneBy({
            id: id
        });

        if (!adopter) {
            fs.unlink("./uploads/" + image, () => { });
            throw new NotFoundException("Adopter not found");
        }

        if (adopter.profileImage) {
            fs.unlink("./uploads/" + adopter.profileImage, () => { });
        }

        await this.adopterRepository.update(id, { profileImage: image });

        return {
            message: "Profile photo updated successfully",
            profileImage: image
        };
    }

    async removeAdopter(id: number): Promise<object> {

        const adopter = await this.adopterRepository.findOneBy({
            id: id
        });

        if (!adopter) {
            throw new NotFoundException(
                "Adopter not found"
            );
        }

        await this.adopterRepository.delete(id);

        // remove the profile photo file as well
        if (adopter.profileImage) {
            fs.unlink("./uploads/" + adopter.profileImage, () => { });
        }

        return {
            message: "Adopter deleted successfully"
        };
    }
}
