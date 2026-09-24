export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  isVerified: boolean;
  role: "ANALYST" | "AUDITOR" | "ADMIN";
}

export class AuthService {
  private static currentUser: UserProfile = {
    id: "usr-default-analyst",
    email: "camilo.a.consul@gmail.com",
    displayName: "Camilo Consul",
    isVerified: true,
    role: "ANALYST"
  };

  public static getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public static switchUser(user: UserProfile): void {
    this.currentUser = user;
  }

  public static logout(): void {
    this.currentUser = {
      id: "usr-anonymous",
      email: "",
      displayName: "Sesión Cerrada",
      isVerified: false,
      role: "ANALYST"
    };
  }
}
