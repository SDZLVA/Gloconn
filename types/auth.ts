/**
 * Authentication types for Glooconn.
 */

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type AuthFormState = {
  email: string;
  password: string;
};
