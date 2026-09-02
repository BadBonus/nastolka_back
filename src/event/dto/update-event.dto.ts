import { PartialType } from '@nestjs/swagger';
import { CreateEventDtoReq } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDtoReq) {}
