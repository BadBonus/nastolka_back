import { PartialType } from '@nestjs/swagger';
import { CreateEventDtoReq } from './create-event.query.dto';

export class UpdateEventDto extends PartialType(CreateEventDtoReq) {}
