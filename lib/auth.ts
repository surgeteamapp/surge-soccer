import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth(role?: UserRole | UserRole[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role as UserRole)) {
      redirect("/unauthorized");
    }
  }
  
  return user;
}

export function canAccess(userRole: UserRole, requiredRoles: UserRole | UserRole[]) {
  if (!requiredRoles) return true;
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
}
