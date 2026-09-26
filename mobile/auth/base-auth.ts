export interface IAuthHandler {
  exchangeCodeForSession(code: string): Promise<any>;
  signInWithIdToken(credentials: any): Promise<any>;
  signInWithOAuth(credentials: any): Promise<any>;
  signInWithPassword(email: string, password: string): Promise<any>;
  signUp(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  verifyOtp(email: string, code: string): Promise<any>;
  signInWithOtp(email: string): Promise<void>;
  resend(email: string): Promise<void>;
  resetPasswordForEmail(email: string): Promise<void>;
  updatePassword(password: string): Promise<any>;
}

export class BaseAuthHandler implements IAuthHandler {
  updatePassword(password: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  resetPasswordForEmail(email: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resend(email: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  signInWithOtp(email: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  verifyOtp(email: string, code: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  signOut(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  signUp(email: string, password: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  signInWithPassword(email: string, password: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  signInWithOAuth(credentials: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  signInWithIdToken(credentials: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  exchangeCodeForSession(code: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
