import { Injectable, NotFoundException, ConflictException, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import * as bcrypt from "bcrypt";
import Pusher from "pusher";
import * as fs from "fs";

import { VetForm } from "./vet.dto";
import { VetEntity } from "./vet.entity";
import { AdopterEntity } from "../Adopter/adopter.entity";
import { MailerService } from "@nestjs-modules/mailer";

// Columns we send back for a vet (never send the password hash)
const vetColumns = {
    id: true,
    name: true,
    fullName: true,
    email: true,
    phone: true,
    status: true,
    profileImage: true,
};


@Injectable()
export class VetService {

    private pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true,
    });

    constructor(

        @InjectRepository(VetEntity)
        private vetRepository: Repository<VetEntity>,

        @InjectRepository(AdopterEntity)
        private adopterRepository: Repository<AdopterEntity>,

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
                subject: "Welcome Veterinarian - PawsHome BD",
                text:
                    `Hello Dr. ${name}, welcome to PawsHome BD. ` +
                    `Your Veterinarian account has been created successfully.`
            });

            return {
                message: "Vet welcome email sent successfully",
                receiver: email
            };

        } catch (error) {

            console.error(
                "VET MAILER ERROR:",
                error
            );

            throw new HttpException(
                "Vet welcome email could not be sent",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ---------- Vet - Adopter relation ----------

    async assignAdopter(
        vetId: number,
        adopterId: number
    ) {

        const vet = await this.vetRepository.findOneBy({
            id: vetId
        });

        const adopter = await this.adopterRepository.findOneBy({
            id: adopterId
        });

        if (!vet || !adopter) {
            throw new NotFoundException(
                "Vet or Adopter not found"
            );
        }

        adopter.vet = vet;
        await this.adopterRepository.save(adopter);

        return {
            message: "Adopter assigned to vet successfully"
        };
    }

    async getVetAdopters(
        vetId: number
    ) {

        const vet = await this.vetRepository.findOneBy({
            id: vetId
        });

        if (!vet) {
            throw new NotFoundException(
                "Vet not found"
            );
        }

        // only the safe adopter columns
        return this.adopterRepository.find({
            where: {
                vet: { id: vetId }
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

        adopter.vet = null as any;
        await this.adopterRepository.save(adopter);

        return {
            message: "Adopter removed from vet successfully"
        };
    }

    // ---------- Vet CRUD ----------

    getVet(): string {
        return "Vet Module - PawsHome BD";
    }

    async getAllVets(): Promise<VetEntity[]> {
        return this.vetRepository.find({
            select: vetColumns
        });
    }

    async getVetByID(id: number): Promise<VetEntity> {

        const vet = await this.vetRepository.findOne({
            where: { id: id },
            select: vetColumns
        });

        if (!vet) {
            throw new NotFoundException("Vet not found");
        }

        return vet;
    }

    // ILike() gives a partial match that ignores upper/lower case on the full name
    async searchByName(name: string): Promise<VetEntity[]> {
        return this.vetRepository.find({
            where: { fullName: ILike(`%${name}%`) },
            select: vetColumns
        });
    }

    async createVet(mydto: VetForm): Promise<object> {

        const existingVet = await this.vetRepository.findOneBy({ email: mydto.email! });

        if (existingVet) {
            throw new ConflictException("Vet with this email already exists");
        }

        mydto.password = await bcrypt.hash(
            mydto.password!,
            10
        );

        const vet = this.vetRepository.create(mydto);
        const savedVet = await this.vetRepository.save(vet);

        // realtime notification for the vet dashboard
        await this.pusher.trigger(
            "vet-channel",
            "new-vet",
            {
                message: "A new vet has registered",
                name: savedVet.fullName,
            }
        );

        return {
            message: "Vet registered successfully",
            id: savedVet.id
        };
    }

    async updateVet(
        id: number,
        mydto: VetForm
    ): Promise<VetEntity> {

        const vet = await this.vetRepository.findOneBy({
            id: id
        });

        if (!vet) {
            throw new NotFoundException("Vet not found");
        }

        // Hash only when a new password is provided
        if (mydto.password) {
            mydto.password = await bcrypt.hash(mydto.password, 10);
        }

        await this.vetRepository.update(
            id,
            mydto
        );

        return this.getVetByID(id);
    }

    async changeStatus(
        id: number,
        status: string
    ): Promise<VetEntity> {

        const vet = await this.vetRepository.findOneBy({
            id: id
        });

        if (!vet) {
            throw new NotFoundException("Vet not found");
        }

        if (status !== "active" && status !== "inactive") {
            throw new BadRequestException("Status must be active or inactive");
        }

        await this.vetRepository.update(
            id,
            {
                status: status
            }
        );

        return this.getVetByID(id);
    }

    // save the new profile photo name and delete the old file
    async uploadPhoto(id: number, image: string): Promise<object> {

        const vet = await this.vetRepository.findOneBy({
            id: id
        });

        if (!vet) {
            fs.unlink("./uploads/" + image, () => { });
            throw new NotFoundException("Vet not found");
        }

        if (vet.profileImage) {
            fs.unlink("./uploads/" + vet.profileImage, () => { });
        }

        await this.vetRepository.update(id, { profileImage: image });

        return {
            message: "Profile photo updated successfully",
            profileImage: image
        };
    }

    async removeVet(id: number): Promise<object> {

        const vet = await this.vetRepository.findOneBy({
            id: id
        });

        if (!vet) {
            throw new NotFoundException("Vet not found");
        }

        await this.vetRepository.delete(id);

        // remove the profile photo file as well
        if (vet.profileImage) {
            fs.unlink("./uploads/" + vet.profileImage, () => { });
        }

        return {
            message: "Vet deleted successfully"
        };
    }
}
