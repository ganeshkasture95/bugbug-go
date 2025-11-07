// src/lib/notifications.ts
import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  // Create a notification for a user
  static async createNotification(
    userId: string,
    message: string,
    type: NotificationType
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          type,
        },
      });
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Notify company when researcher enrolls in their program
  static async notifyCompanyOfEnrollment(
    programId: string,
    researcherName: string,
    researcherEmail: string
  ) {
    try {
      // Get the program and company info
      const program = await prisma.program.findUnique({
        where: { id: programId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!program) {
        throw new Error('Program not found');
      }

      const message = `New researcher ${researcherName} (${researcherEmail}) has joined your program "${program.title}"`;

      await this.createNotification(
        program.companyId,
        message,
        NotificationType.System
      );

      return true;
    } catch (error) {
      console.error('Failed to notify company of enrollment:', error);
      throw error;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string, limit: number = 10) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return notifications;
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user owns the notification
        },
        data: {
          read: true,
        },
      });
      return notification;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
      return count;
    } catch (error) {
      console.error('Failed to get unread notification count:', error);
      return 0;
    }
  }
}