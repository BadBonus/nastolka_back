import { EventMaterial, EventMaterialType } from '@pGen/client';
import { buildImagePath } from '@/utils/pathToImg';
import { EventMaterialResponseDto } from './dto';

export function buildEventMaterialUrl(storageKey: string): string {
  return `/${buildImagePath('events_materials')}${storageKey}`;
}

export function mapEventMaterialToResponse(
  material: EventMaterial,
): EventMaterialResponseDto {
  if (material.type === EventMaterialType.FILE) {
    return {
      id: material.id,
      type: EventMaterialType.FILE,
      title: material.title,
      sortOrder: material.sortOrder,
      isPublic: material.isPublic,
      originalName: material.originalName ?? '',
      mimeType: material.mimeType ?? '',
      sizeBytes: material.sizeBytes ?? 0,
      url: material.storageKey
        ? buildEventMaterialUrl(material.storageKey)
        : '',
    };
  }

  return {
    id: material.id,
    type: EventMaterialType.NOTE,
    title: material.title,
    sortOrder: material.sortOrder,
    isPublic: material.isPublic,
    body: material.body ?? '',
  };
}
