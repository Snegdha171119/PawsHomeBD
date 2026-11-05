// load .env here because the JWT module reads this secret when the file is imported
import "dotenv/config";

export const jwtConstants = {
    secret: process.env.ADMIN_JWT_SECRET!,
};
