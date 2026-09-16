import { AppEnumsDto } from './app-enums.dto';
import { PaginationMetaDto } from './pagination-meta.dto';
import { BaseQueryDto } from './base-query.dto';

export * from './pagination-meta.dto';
export * from './app-enums.dto';
export * from './base-query.dto';

export const extraCommonDto = [AppEnumsDto, PaginationMetaDto, BaseQueryDto];
