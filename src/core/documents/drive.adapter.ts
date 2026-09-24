export interface DriveFileReference {
  fileId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
}

export class DriveAdapter {
  public static readonly REQUIRED_SCOPE = "https://www.googleapis.com/auth/drive.file";

  public static isConnected(): boolean {
    return false; // In FREE_PROTOTYPE, requires user OAuth connection
  }

  public static getAuthorizationInstructions(): string {
    return "Para conectar Google Drive con el alcance mínimo restringido ('drive.file'), provisione el acceso OAuth mediante el flujo interactivo de autorización de cuenta Google.";
  }
}
