import { AuthGuard } from "@nestjs/passport";

export class JwtAuthRefreshGuard extends AuthGuard('jwt-refresh') {}