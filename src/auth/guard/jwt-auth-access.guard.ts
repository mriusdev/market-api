import { AuthGuard } from "@nestjs/passport";

export class JwtAuthAccessGuard extends AuthGuard('jwt') {}