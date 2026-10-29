import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventMaterialType, Prisma } from '@pGen/client';
import { ERole } from '@/common/enums/roles.enum';
import { UploadsService } from '@/common/modules/uploads/uploads.service';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import path from 'path';
import {
  EVENT_MATERIAL_MAX_FILES,
  EVENT_MATERIAL_MAX_NOTES,
  PATH_UPLOADED_EVENTS_MATERIALS,
} from './event-material.constants';
import {
  CreateEventMaterialFileDtoReq,
  CreateEventMaterialNoteDtoReq,
  EventMaterialResponseDto,
  ReorderEventMaterialsDto,
  UpdateEventMaterialDto,
} from './dto';
import { mapEventMaterialToResponse } from './event-material.mapper';

@Injectable()
export class EventMaterialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  async createNote(
    eventId: string,
    userId: string,
    dto: CreateEventMaterialNoteDtoReq,
  ): Promise<EventMaterialResponseDto> {
    await this.checkOwnership(eventId, userId);
    await this.assertCountLimit(eventId, EventMaterialType.NOTE);

    const sortOrder =
      dto.sortOrder ?? (await this.nextSortOrder(eventId));

    const material = await this.prisma.eventMaterial.create({
      data: {
        eventId,
        type: EventMaterialType.NOTE,
        title: dto.title,
        body: dto.body,
        isPublic: dto.isPublic ?? true,
        sortOrder,
      },
    });

    return plainToInstance(
      EventMaterialResponseDto,
      mapEventMaterialToResponse(material),
    );
  }

  async createFile(
    eventId: string,
    userId: string,
    dto: CreateEventMaterialFileDtoReq,
    file: Express.Multer.File,
  ): Promise<EventMaterialResponseDto> {
    await this.checkOwnership(eventId, userId);
    await this.assertCountLimit(eventId, EventMaterialType.FILE);

    const ext = path
      .extname(file.originalname || '')
      .replace(/^\./, '')
      .toLowerCase();

    const saved = await this.uploadsService.saveBufferToDisk(
      file.buffer,
      ext,
      PATH_UPLOADED_EVENTS_MATERIALS,
    );

    const sortOrder = await this.nextSortOrder(eventId);

    try {
      const material = await this.prisma.eventMaterial.create({
        data: {
          eventId,
          type: EventMaterialType.FILE,
          title: dto.title,
          isPublic: dto.isPublic ?? true,
          sortOrder,
          storageKey: saved.fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        },
      });

      return plainToInstance(
        EventMaterialResponseDto,
        mapEventMaterialToResponse(material),
      );
    } catch (error) {
      await this.uploadsService.deleteFromDisk(
        saved.fileName,
        PATH_UPLOADED_EVENTS_MATERIALS,
      );
      throw error;
    }
  }

  async update(
    eventId: string,
    materialId: string,
    userId: string,
    dto: UpdateEventMaterialDto,
  ): Promise<EventMaterialResponseDto> {
    await this.checkOwnership(eventId, userId);
    const material = await this.findMaterialOrThrow(eventId, materialId);

    if (dto.body !== undefined && material.type === EventMaterialType.FILE) {
      throw new BadRequestException(
        'Поле body допустимо только для материалов типа NOTE',
      );
    }

    const data: Prisma.EventMaterialUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.isPublic !== undefined) data.isPublic = dto.isPublic;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.body !== undefined) data.body = dto.body;

    const updated = await this.prisma.eventMaterial.update({
      where: { id: materialId },
      data,
    });

    return plainToInstance(
      EventMaterialResponseDto,
      mapEventMaterialToResponse(updated),
    );
  }

  async reorder(
    eventId: string,
    userId: string,
    dto: ReorderEventMaterialsDto,
  ): Promise<EventMaterialResponseDto[]> {
    await this.checkOwnership(eventId, userId);

    const materials = await this.prisma.eventMaterial.findMany({
      where: { eventId },
      select: { id: true },
    });

    const existingIds = new Set(materials.map((m) => m.id));
    if (dto.ids.length !== existingIds.size) {
      throw new BadRequestException(
        'Список ids должен содержать все материалы события ровно один раз',
      );
    }

    for (const id of dto.ids) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(
          'Материал не найден или не принадлежит событию',
        );
      }
    }

    const uniqueIds = new Set(dto.ids);
    if (uniqueIds.size !== dto.ids.length) {
      throw new BadRequestException('В списке ids есть дубликаты');
    }

    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.eventMaterial.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    const ordered = await this.prisma.eventMaterial.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' },
    });

    return plainToInstance(
      EventMaterialResponseDto,
      ordered.map(mapEventMaterialToResponse),
    );
  }

  async remove(
    eventId: string,
    materialId: string,
    userId: string,
  ): Promise<void> {
    await this.checkOwnership(eventId, userId);
    const material = await this.findMaterialOrThrow(eventId, materialId);

    await this.prisma.eventMaterial.delete({ where: { id: materialId } });

    if (
      material.type === EventMaterialType.FILE &&
      material.storageKey
    ) {
      await this.uploadsService.deleteFromDisk(
        material.storageKey,
        PATH_UPLOADED_EVENTS_MATERIALS,
      );
    }
  }

  async cleanupFilesForEvent(eventId: string): Promise<void> {
    const files = await this.prisma.eventMaterial.findMany({
      where: { eventId, type: EventMaterialType.FILE },
      select: { storageKey: true },
    });

    await Promise.all(
      files
        .filter((f) => f.storageKey)
        .map((f) =>
          this.uploadsService.deleteFromDisk(
            f.storageKey!,
            PATH_UPLOADED_EVENTS_MATERIALS,
          ),
        ),
    );
  }

  private async assertCountLimit(
    eventId: string,
    type: EventMaterialType,
  ): Promise<void> {
    const count = await this.prisma.eventMaterial.count({
      where: { eventId, type },
    });

    const limit =
      type === EventMaterialType.FILE
        ? EVENT_MATERIAL_MAX_FILES
        : EVENT_MATERIAL_MAX_NOTES;

    if (count >= limit) {
      throw new BadRequestException(
        type === EventMaterialType.FILE
          ? `Достигнут лимит файлов на событие (${EVENT_MATERIAL_MAX_FILES})`
          : `Достигнут лимит заметок на событие (${EVENT_MATERIAL_MAX_NOTES})`,
      );
    }
  }

  private async nextSortOrder(eventId: string): Promise<number> {
    const last = await this.prisma.eventMaterial.findFirst({
      where: { eventId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return (last?.sortOrder ?? -1) + 1;
  }

  private async findMaterialOrThrow(eventId: string, materialId: string) {
    const material = await this.prisma.eventMaterial.findFirst({
      where: { id: materialId, eventId },
    });

    if (!material) {
      throw new NotFoundException(
        'Материал не найден или не принадлежит событию',
      );
    }

    return material;
  }

  private async checkOwnership(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { org: { select: { userId: true } } },
    });

    if (!event) {
      throw new NotFoundException('Ивент не найден');
    }

    if (event.org.userId === userId) {
      return event;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: { select: { slug: true } } },
    });

    if (user?.roles.some((role) => role.slug === ERole.ADMIN)) {
      return event;
    }

    throw new ForbiddenException(
      'Недостаточно прав для управления материалами этого ивента',
    );
  }
}
