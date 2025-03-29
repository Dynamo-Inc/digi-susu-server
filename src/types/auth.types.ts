export const UserSessionTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetpassword',
  VERIFY_EMAIL: 'verifyemail',
  VERIFY_PHONE: 'verifyphone',
  SET_KYC: 'setkyc',
} as const;

export const TokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetpassword',
  VERIFY_EMAIL: 'verifyemail',
  VERIFY_PHONE: 'verifyphone',
  SET_KYC: 'setkyc',
} as const;

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

export type UserSessionType = (typeof UserSessionTypes)[keyof typeof UserSessionTypes];

export type DataStoredInUserSession = {
  sub: string;
  iat: number;
  exp: number;
  type: UserSessionType;
};

export type DataStoredInUserInvitationSession = {
  sub: string;
  iat: number;
  exp: number;
  type: UserSessionType;
  invitedBy: string;
};
