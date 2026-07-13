import { prisma } from "@/config/db.config";

class UserRepository {
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }
}

export const userRepository = new UserRepository();
