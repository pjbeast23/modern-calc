import {User, Worksheet } from "@prisma/client";

export type Auth = {
  userId: string;
  email: string;
};
export type UserWithClerkId = User & {
    clerkId: string;
    };
export type WorksheetWithUser = Worksheet & {
    user: UserWithClerkId;
};
