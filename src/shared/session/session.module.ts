import {Module} from "@nestjs/common";
import {SessionService} from "./session.service";
import { TokenModule } from "@/shared/token/token.module";
import { PrismaModule } from "@/prisma/prisma.module";

@Module({
  imports: [TokenModule, PrismaModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}