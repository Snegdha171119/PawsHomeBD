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

import { VetService } from "./vet.service";
import { VetForm } from "./vet.dto";
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


@Controller("vet")
export class VetController {

    constructor(
        private readonly vetService: VetService
    ) { }

    @Get()
    getVet() {
        return this.vetService.getVet();
    }

    @Get("getallvets")
    getAllVets() {
        return this.vetService.getAllVets();
    }

    @Get("getvetbyid/:id")
    getVetByID(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.vetService.getVetByID(id);
    }

    // search vets by part of the full name
    @Get("searchbyname/:name")
    searchByName(
        @Param("name") name: string
    ) {
        return this.vetService.searchByName(name);
    }

    @Post("createvet")
    @UsePipes(new ValidationPipe())
    createVet(
        @Body() mydto: VetForm
    ) {
        return this.vetService.createVet(mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Put("updatevet/:id")
    @UsePipes(new ValidationPipe())
    updateVet(
        @Param("id", ParseIntPipe) id: number,
        @Body() mydto: VetForm
    ) {
        return this.vetService.updateVet(id, mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch("changestatus/:id")
    changeStatus(
        @Param("id", ParseIntPipe) id: number,
        @Body("status") status: string
    ) {
        return this.vetService.changeStatus(id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("remove/:id")
    removeVet(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.vetService.removeVet(id);
    }

    // profile photo for a vet account
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

        return this.vetService.uploadPhoto(id, file.filename);
    }

    // send the saved photo back
    @Get("getimage/:name")
    getImage(
        @Param("name") name: string,
        @Res() res: any
    ) {
        res.sendFile(name, { root: "./uploads" });
    }

    // ---------- Vet - Adopter relation ----------

    @UseGuards(JwtAuthGuard)
    @Post("assign-adopter")
    assignAdopter(
        @Body() body: {
            vetId: number,
            adopterId: number
        }
    ) {
        return this.vetService.assignAdopter(
            body.vetId,
            body.adopterId
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/adopters")
    getVetAdopters(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.vetService.getVetAdopters(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("remove-adopter/:id")
    removeAdopter(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.vetService.removeAdopter(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post("send-welcome-email")
    sendWelcomeEmail(
        @Body() body: {
            email: string;
            name: string;
        }
    ) {
        return this.vetService.sendWelcomeEmail(
            body.email,
            body.name
        );
    }
}
