import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    UsePipes,
    ValidationPipe,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Res,
    BadRequestException
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { AdopterService } from "./adopter.service";
import { AdopterDTO } from "./adopter.dto";
import { JwtAuthGuard } from "./Auth/auth.guard";

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


@Controller("adopter")
export class AdopterController {

    constructor(
        private readonly adopterService: AdopterService
    ) { }

    @Get()
    getAdopter(): string {
        return this.adopterService.getAdopter();
    }

    @Get("getalladopters")
    getAllAdopters() {
        return this.adopterService.getAllAdopters();
    }

    @Get("getadopterbyid/:id")
    getAdopterByID(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.adopterService.getAdopterByID(id);
    }

    // approved pets that adopters can browse
    @Get("availablepets")
    getAvailablePets() {
        return this.adopterService.getAvailablePets();
    }

    @Post("createadopter")
    @UsePipes(new ValidationPipe())
    createAdopter(
        @Body() mydto: AdopterDTO
    ) {
        return this.adopterService.createAdopter(mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Put("updateadopter/:id")
    @UsePipes(new ValidationPipe())
    updateAdopter(
        @Param("id", ParseIntPipe) id: number,
        @Body() mydto: AdopterDTO
    ) {
        return this.adopterService.updateAdopter(id, mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch("changestatus/:id")
    changeStatus(
        @Param("id", ParseIntPipe) id: number,
        @Body("status") status: string
    ) {
        return this.adopterService.changeStatus(id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("remove/:id")
    removeAdopter(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.adopterService.removeAdopter(id);
    }

    // profile photo for an adopter account
    @UseGuards(JwtAuthGuard)
    @Post("uploadphoto/:id")
    @UseInterceptors(FileInterceptor("image", imageUpload))
    uploadPhoto(
        @Param("id", ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException("Please choose an image");
        }

        return this.adopterService.uploadPhoto(id, file.filename);
    }

    // send the saved photo back
    @Get("getimage/:name")
    getImage(
        @Param("name") name: string,
        @Res() res: any
    ) {
        res.sendFile(name, { root: "./uploads" });
    }

    // ---------- Adopter - Vet relation ----------

    @UseGuards(JwtAuthGuard)
    @Post("assign-vet")
    assignVet(
        @Body() body: {
            adopterId: number,
            vetId: number
        }
    ) {
        return this.adopterService.assignVet(
            body.adopterId,
            body.vetId
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/vet")
    getAdopterVet(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.adopterService.getAdopterVet(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("remove-vet/:id")
    removeVet(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.adopterService.removeVet(id);
    }

    // ---------- Adopter - Lister relation ----------

    @UseGuards(JwtAuthGuard)
    @Post("assign-lister")
    assignLister(
        @Body() body: {
            adopterId: number,
            listerId: number
        }
    ) {
        return this.adopterService.assignLister(
            body.adopterId,
            body.listerId
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/lister")
    getAdopterLister(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.adopterService.getAdopterLister(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("remove-lister/:id")
    removeLister(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.adopterService.removeLister(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post("send-welcome-email")
    sendWelcomeEmail(
        @Body() body: {
            email: string;
            name: string;
        }
    ) {
        return this.adopterService.sendWelcomeEmail(
            body.email,
            body.name
        );
    }
}
