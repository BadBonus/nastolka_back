import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

/**
 * Гвард контроля доступа на основе разрешений PBAC
 * Выполняет сопоставление требуемых для маршрута разрешений с правами текущего пользователя из базы данных
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  /**
   * Создает экземпляр гварда и внедряет необходимые системные сервисы
   * @param reflector Инструмент NestJS для чтения метаданных с декораторов
   * @param prisma Сервис доступа к базе данных для извлечения связей ролей и прав
   */
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  /**
   * Проверяет правомерность выполнения текущего HTTP запроса
   * Считывает маркеры доступа из контекста обрабатывает структуру объекта пользователя и запрашивает лимит разрешений
   * @param context Контекст выполнения запроса NestJS предоставляющий доступ к HTTP протоколу
   * @returns Логическое значение подтверждающее или отклоняющее доступ пользователя к эндпоинту
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    const userData = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        role: {
          select: {
            permissions: {
              select: {
                permission: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const permissionsMatrix = userData?.role?.permissions || [];
    const userPermissions = permissionsMatrix.map(
      (item) => item.permission.slug,
    );

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
