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
    Req,
    Res,
    UsePipes,
    ValidationPipe,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ListerService } from "./pet_lister.service";
import { ListerDTO } from "./pet_lister.dto";
import { PetDTO } from "./pet.dto";
import { JwtAuthGuard } from "./Auth/auth.guard";

// upload settings for pet photos and profile photos (same as the lecture example)
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


@Controller("lister")
export class ListerController {

    constructor(
        private readonly listerService: ListerService
    ) { }

    @Get()
    getLister(): string {
        return this.listerService.getLister();
    }

    @Get("getalllisters")
    getAllListers(): object {
        return this.listerService.getAllListers();
    }

    @Get("getlisterbyid/:id")
    getListerByID(
        @Param("id", ParseIntPipe) id: number
    ): object {
        return this.listerService.getListerByID(id);
    }

    @Post("createlister")
    @UsePipes(new ValidationPipe())
    createLister(
        @Body() mydto: ListerDTO
    ) {
        return this.listerService.createLister(mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Put("updatelister/:id")
    @UsePipes(new ValidationPipe())
    updateLister(
        @Param("id", ParseIntPipe) id: number,
        @Body() mydto: ListerDTO
    ) {
        return this.listerService.updateLister(id, mydto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch("changestatus/:id")
    changeStatus(
        @Param("id", ParseIntPipe) id: number,
        @Body("status") status: string
    ) {
        return this.listerService.changeStatus(id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("remove/:id")
    removeLister(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.listerService.removeLister(id);
    }

    // search listers by part of the full name
    @Get("searchbyfullname/:name")
    searchByFullName(
        @Param("name") name: string
    ) {
        return this.listerService.searchByFullName(name);
    }

    @Get("byusername/:username")
    getListerByUsername(
        @Param("username") username: string
    ) {
        return this.listerService.getListerByUsername(username);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("removebyusername/:username")
    removeListerByUsername(
        @Param("username") username: string
    ) {
        return this.listerService.removeListerByUsername(username);
    }

    // ---------- Pets (the logged in lister comes from the token) ----------

    // pet info comes as form-data together with one photo in the "image" field
    @UseGuards(JwtAuthGuard)
    @Post("addpet")
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(FileInterceptor("image", imageUpload))
    addPet(
        @Req() req: any,
        @Body() mydto: PetDTO,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException("Pet image is required");
        }

        return this.listerService.addPet(req.user.id, mydto, file.filename);
    }

    // profile photo for a lister account
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

        return this.listerService.uploadPhoto(id, file.filename);
    }

    // send the saved photo back, e.g. /lister/getimage/1730000000000-tommy.jpg
    @Get("getimage/:name")
    getImage(
        @Param("name") name: string,
        @Res() res: any
    ) {
        res.sendFile(name, { root: "./uploads" });
    }

    @UseGuards(JwtAuthGuard)
    @Get("getmypets")
    getMyPets(
        @Req() req: any
    ) {
        return this.listerService.getMyPets(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("removepet/:id")
    removePet(
        @Req() req: any,
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.listerService.removePet(req.user.id, id);
    }

    // ---------- Lister - Adopter relation ----------

    @UseGuards(JwtAuthGuard)
    @Post("assign-adopter")
    assignAdopter(
        @Body() body: {
            listerId: number,
            adopterId: number
        }
    ) {
        return this.listerService.assignAdopter(
            body.listerId,
            body.adopterId
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id/adopters")
    getListerAdopters(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.listerService.getListerAdopters(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("remove-adopter/:id")
    removeAdopter(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.listerService.removeAdopter(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post("send-welcome-email")
    sendWelcomeEmail(
        @Body() body: {
            email: string;
            name: string;
        }
    ) {
        return this.listerService.sendWelcomeEmail(
            body.email,
            body.name
        );
    }
}
