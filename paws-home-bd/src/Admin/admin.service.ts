import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminForm } from "./admin.dto";
import { AdminEntity } from "./admin.entity";
import { ListerEntity } from "../Pet_lister/pet_lister.entity";
import { AdminProfileEntity } from "./admin_profile.entity";
import { AdminProfileDTO } from "./admin_profile.dto";
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException } from "@nestjs/common";
import { PetEntity } from "../Pet_lister/pet.entity";
import { VetEntity } from "../Vet/vet.entity";
import { AdopterEntity } from "../Adopter/adopter.entity";
import Pusher from "pusher";
import * as bcrypt from 'bcrypt';
import * as fs from "fs";

@Injectable()
export class AdminService {
    private pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true,
    });
    constructor(
        @InjectRepository(AdminEntity)
        private adminRepository: Repository<AdminEntity>,

        @InjectRepository(ListerEntity)
        private listerRepository: Repository<ListerEntity>,

        @InjectRepository(AdminProfileEntity)
        private adminProfileRepository: Repository<AdminProfileEntity>,

        @InjectRepository(PetEntity)
        private petRepository: Repository<PetEntity>,

        @InjectRepository(VetEntity)
        private vetRepository: Repository<VetEntity>,

        @InjectRepository(AdopterEntity)
        private adopterRepository: Repository<AdopterEntity>,

        private readonly mailerService: MailerService,
    ) { }


    async sendWelcomeEmail(email: string, name: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: "Welcome to PawsHome BD",
            text: `Welcome, ${name}!

              Your PawsHome BD account has been created successfully.`
        });

        return {
            message: "Welcome email sent successfully",
        };
    }

    async createAdminProfile(adminId: number, mydto: AdminProfileDTO) {
        const admin = await this.adminRepository.findOne({
            where: { id: adminId },
            relations: { profile: true },
        });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        if (admin.profile) {
            throw new ConflictException("This Admin already has a profile");
        }

        const profile = this.adminProfileRepository.create({
            ...mydto,
            admin: admin,
        });

        const savedProfile = await this.adminProfileRepository.save(profile);

        return {
            id: savedProfile.id,
            address: savedProfile.address,
            designation: savedProfile.designation,
            bio: savedProfile.bio,
            qualification: savedProfile.qualification,
        };
    }

    async getAdminProfile(adminId: number) {
        const admin = await this.adminRepository.findOne({
            where: { id: adminId },
            relations: { profile: true },
        });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        if (!admin.profile) {
            throw new NotFoundException("Admin profile not found");
        }

        return admin.profile;
    }

    async deleteAdminProfile(adminId: number) {
        const admin = await this.adminRepository.findOne({
            where: { id: adminId },
            relations: { profile: true },
        });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        if (!admin.profile) {
            throw new NotFoundException("Admin profile not found");
        }

        await this.adminProfileRepository.delete(admin.profile.id);

        return {
            message: "Admin profile deleted successfully",
        };
    }

    async assignLister(adminId: number, listerId: number) {
        const admin = await this.adminRepository.findOne({
            where: { id: adminId },
            relations: { listers: true },
        });

        const lister = await this.listerRepository.findOne({ where: { id: listerId }, relations: { admin: true } });

        if (!admin || !lister) {
            throw new NotFoundException("Admin or Lister not found");
        }

        // Already assigned check
        if (lister.admin) {

            if (lister.admin.id === adminId) {
                throw new ConflictException(
                    "This lister is already assigned to this admin"
                );
            }

            throw new ConflictException(
                "This lister is already assigned to another admin"
            );
        }

        lister.admin = admin;

        await this.listerRepository.save(lister);
        return this.adminRepository.findOne({ where: { id: adminId }, relations: { listers: true } });
    }

    async getAdminListers(adminId: number) {
        const admin = await this.adminRepository.findOne({
            where: { id: adminId },
            relations: { listers: true },
        });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        return admin.listers;
    }

    async removeLister(listerId: number) {
        const lister = await this.listerRepository.findOneBy({ id: listerId });

        if (!lister) {
            throw new NotFoundException("Lister not found");
        }

        lister.admin = null as any;

        return this.listerRepository.save(lister);
    }

    getAdmin(): string {
        return "Admin Module: PawsHome BD";
    }

    async getAllUsers(): Promise<AdminEntity[]> {
        return this.adminRepository.find();
    }

    async getUserByID(id: number): Promise<AdminEntity> {
        const admin = await this.adminRepository.findOneBy({ id: id });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        return admin;
    }

    async insertAdmin(mydto: AdminForm): Promise<object> {

        const existingAdmin = await this.adminRepository.findOneBy({ email: mydto.email! });


        if (existingAdmin) {
            throw new ConflictException(
                "Admin with this email already exists"
            );

        }
        const hashedPassword = await bcrypt.hash(mydto.password!, 10);

        mydto.password = hashedPassword;

        const admin = this.adminRepository.create(mydto);
        const savedAdmin = await this.adminRepository.save(admin);
        await this.pusher.trigger(
            "admin-channel",
            "new-admin",
            {
                message: "A new admin has registered",
                name: savedAdmin.fullName,
            }
        );
        const emailResult = await this.sendWelcomeEmail(savedAdmin.email, savedAdmin.fullName);

        return {
            ...savedAdmin,
            emailStatus: emailResult.message,
        };
    }

    async updateAdmin(id: number, mydto: AdminForm): Promise<AdminEntity> {
        const admin = await this.adminRepository.findOneBy({ id });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        // Hash only when a new password is provided
        if (mydto.password) {
            mydto.password = await bcrypt.hash(mydto.password, 10);
        }

        await this.adminRepository.update(id, mydto);

        const updatedAdmin = await this.adminRepository.findOneBy({ id });

        if (!updatedAdmin) {
            throw new NotFoundException("Admin not found");
        }

        return updatedAdmin;
    }

    async changeStatus(id: number, status: string): Promise<AdminEntity> {
        const admin = await this.adminRepository.findOneBy({ id: id });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        if (status !== "active" && status !== "inactive") {
            throw new BadRequestException(
                "Status must be active or inactive"
            );
        }

        admin.status = status;

        return await this.adminRepository.save(admin);
    }

    // save the new profile photo name and delete the old file
    async uploadPhoto(id: number, image: string): Promise<object> {
        const admin = await this.adminRepository.findOneBy({ id: id });

        if (!admin) {
            fs.unlink("./uploads/" + image, () => { });
            throw new NotFoundException("Admin not found");
        }

        if (admin.profileImage) {
            fs.unlink("./uploads/" + admin.profileImage, () => { });
        }

        await this.adminRepository.update(id, { profileImage: image });

        return {
            message: "Profile photo updated successfully",
            profileImage: image,
        };
    }

    async deleteAdmin(id: number): Promise<object> {
        const admin = await this.adminRepository.findOneBy({ id: id });

        if (!admin) {
            throw new NotFoundException("Admin not found");
        }

        await this.adminRepository.delete(id);

        // remove the profile photo file as well
        if (admin.profileImage) {
            fs.unlink("./uploads/" + admin.profileImage, () => { });
        }

        return {
            message: "Admin deleted successfully",
        };
    }

    // Pets waiting for admin approval, species filter is optional
    async getPendingPets(species: string): Promise<PetEntity[]> {
        if (species) {
            return this.petRepository.find({
                where: { status: "pending", species: species },
            });
        }

        return this.petRepository.find({
            where: { status: "pending" },
        });
    }

    // Admin approves / rejects a pet, or marks it adopted
    async changePetStatus(id: number, status: string): Promise<PetEntity> {
        const pet = await this.petRepository.findOneBy({ id: id });

        if (!pet) {
            throw new NotFoundException("Pet not found");
        }

        if (status !== "approved" && status !== "rejected" && status !== "adopted") {
            throw new BadRequestException(
                "Status must be approved, rejected or adopted"
            );
        }

        pet.status = status;

        return await this.petRepository.save(pet);
    }

    // Real counts from the database for the dashboard cards
    async getDashboard(role: string): Promise<object> {
        const totalAdmins = await this.adminRepository.count();
        const totalVets = await this.vetRepository.count();
        const totalListers = await this.listerRepository.count();
        const totalAdopters = await this.adopterRepository.count();

        const totalPets = await this.petRepository.count();
        const totalAdoptions = await this.petRepository.countBy({ status: "adopted" });
        const pendingApprovals = await this.petRepository.countBy({ status: "pending" });

        return {
            totalUsers: totalAdmins + totalVets + totalListers + totalAdopters,
            totalPets: totalPets,
            totalAdoptions: totalAdoptions,
            pendingApprovals: pendingApprovals,
            filterByRole: role,
        };
    }
}