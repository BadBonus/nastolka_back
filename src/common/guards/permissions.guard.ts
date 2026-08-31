import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

/**
 * Гвард контроля доступа на основе разрешений (PBAC).
 * Сопоставляет разрешения, требуемые маршрутом (через декоратор
 * @RequirePermissions), с фактическим набором прав текущего
 * пользователя, собранным из всех назначенных ему ролей.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  /**
   * @param reflector Инструмент NestJS для чтения метаданных с декораторов
   * @param prisma Сервис доступа к базе данных для извлечения ролей и прав пользователя
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Проверяет, что текущий пользователь обладает всеми разрешениями,
   * заявленными на обработчике или контроллере маршрута.
   * @param context Контекст выполнения запроса NestJS
   * @returns true, если доступ разрешён; иначе выбрасывает ForbiddenException
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
    const userId: string | undefined = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Пользователь не аутентифицирован');
    }

    const userPermissions = await this.getUserPermissions(userId);

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Недостаточно прав для выполнения операции');
    }

    return true;
  }

  /**
   * Загружает пользователя вместе со всеми его ролями и правами
   * и собирает их в плоское множество уникальных slug'ов разрешений.
   * @param userId Идентификатор пользователя из JWT-пейлоада
   * @returns Множество slug'ов разрешений, доступных пользователю
   */
  private async getUserPermissions(userId: string): Promise<Set<string>> {
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isBanned: true,
        roles: {
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

    if (!userData) {
      throw new ForbiddenException('Пользователь не найден');
    }

    // Забаненный пользователь не должен проходить проверку прав,
    // даже если у его ролей формально есть нужные разрешения.
    // NOTE: если бан уже проверяется отдельным гвардом выше по цепочке
    // (например, глобальным AuthGuard), эту проверку можно убрать —
    // сейчас она добавлена как защита на случай отсутствия такого гварда.
    if (userData.isBanned) {
      throw new ForbiddenException('Учётная запись заблокирована');
    }

    // roles — массив ролей пользователя, у каждой роли свой набор
    // permissions, поэтому структуру нужно "расплющить", а не брать
    // .permissions напрямую с массива ролей
    return new Set(
      userData.roles.flatMap((role) =>
        role.permissions.map(
          (rolePermission) => rolePermission.permission.slug,
        ),
      ),
    );
  }
}
