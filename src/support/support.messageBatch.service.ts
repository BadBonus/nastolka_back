import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

interface MessagePayload {
  ticketId: string;
  senderId: string;
  content: string;
}

@Injectable()
export class MessageBatchService implements OnModuleInit, OnModuleDestroy {
  private queue: MessagePayload[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => this.flush(), 500);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.flush();
  }

  enqueue(message: MessagePayload) {
    this.queue.push(message);
    if (this.queue.length >= 50) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;
    const buffer = [...this.queue];
    this.queue = [];
    await this.prisma.supportMessage.createMany({
      data: buffer,
    });
  }
}
