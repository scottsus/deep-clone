import { Role } from "@prisma/client";

export type Message = {
  role: Role;
  time: number;
  content: string;
};
