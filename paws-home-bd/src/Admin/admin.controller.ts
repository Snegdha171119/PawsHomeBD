import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ValidationPipe, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Res } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { AdminService } from "./admin.service";
import { AdminForm } from "./admin.dto";
import { JwtAuthGuard } from "./Auth/auth.guard";
import { AdminProfileDTO } from "./admin_profile.dto";
import { BadRequestException } from "@nestjs/common";

// upload settings for the profile photo (same as the lecture example)
const imageUpload = {
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/i)) {
            cb(null, true);
        } else {
            cb(new BadRequestException("Only jpg, jpeg, png or webp images are allowed"), false);
        }
    },
    limits: { fileSize: 2000000 }, // 2 MB
    storage: diskStorage({
        destination: "./uploads",
        filename: function (req, file, cb) {
            // spaces break image urls, so swap them for dashes
            cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
        },
    }),
};

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get()
    getAdmin(): string {
        return this.adminService.getAdmin();
    }

    
    @Get('getallusers')
    getAllUsers(): object {
        return this.adminService.getAllUsers();
    }

    @Get('getuserbyid/:id')
    getUserByID(@Param('id') id: number): object {
        return this.adminService.getUserByID(id);
    }

    @Get('getpendingpets')
    getPendingPets(@Query('species') species: string): object {
        return this.adminService.getPendingPets(species);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('changepetstatus/:id')
    changePetStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {

        if (!status) {
            throw new BadRequestException("Status field is required");
        }
        return this.adminService.changePetStatus(id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Get('dashboard')
    getDashboard(@Query('role') role: string): object {
        return this.adminService.getDashboard(role);
    }


    @Post('insertadmin')
    @UsePipes(new ValidationPipe())
    insertAdmin(@Body() mydto: AdminForm): object {
        return this.adminService.insertAdmin(mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('updateadmin/:id')
    @UsePipes(new ValidationPipe())
    updateAdmin(@Param('id') id: number, @Body() mydto: AdminForm): object {
        return this.adminService.updateAdmin(id, mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('changestatus/:id')
    changeStatus(@Param('id') id: number, @Body('status') status: string) {

        if (!status) {
            throw new BadRequestException("Status field is required");
        }
        return this.adminService.changeStatus(id, status);
    }

    // profile photo for an admin account
    @UseGuards(JwtAuthGuard)
    @Post("uploadphoto/:id")
    @UseInterceptors(FileInterceptor("image", imageUpload))
    uploadPhoto(@Param("id", ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {

        if (!file) {
            throw new BadRequestException("Please choose an image");
        }
        return this.adminService.uploadPhoto(id, file.filename);
    }

    // send the saved photo back
    @Get("getimage/:name")
    getImage(@Param("name") name: string, @Res() res: any) {
        res.sendFile(name, { root: "./uploads" });
    }

    @UseGuards(JwtAuthGuard)
    @Delete('deleteadmin/:id')
    deleteAdmin(@Param('id') id: number) {
        return this.adminService.deleteAdmin(id);
    }

    @Post('assign-lister')
    assignLister(@Body() body: { adminId: number; listerId: number }) {
        return this.adminService.assignLister(body.adminId, body.listerId);
    }

    @Get(':id/listers')
    getAdminListers(@Param('id') id: number) {
        return this.adminService.getAdminListers(id);
    }

    @Delete('remove-lister/:id')
    removeLister(@Param('id') id: number) {
        return this.adminService.removeLister(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/profile")
    @UsePipes(new ValidationPipe())
    createAdminProfile(
        @Param("id", ParseIntPipe) id: number,
        @Body() mydto: AdminProfileDTO,
    ) {
        return this.adminService.createAdminProfile(id, mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/profile")
    getAdminProfile(@Param("id", ParseIntPipe) id: number) {
        return this.adminService.getAdminProfile(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id/profile")
    deleteAdminProfile(@Param("id", ParseIntPipe) id: number) {
        return this.adminService.deleteAdminProfile(id);
    }

    @Post("send-welcome-email")
    sendWelcomeEmail(@Body() body: { email: string; name: string }) {
        return this.adminService.sendWelcomeEmail(body.email, body.name);
    }

}