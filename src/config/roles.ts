export enum Role {
  Admin = 'admin',
}

const ALL_ROLES = {
  [Role.Admin]: ['Telehealth', 'scheduele', 'users', 'billings', 'feedback'],
} as const;

const ROLES = Object.keys(ALL_ROLES);

const ROLE_RIGHTS = new Map(Object.entries(ALL_ROLES));

export { ALL_ROLES, ROLES, ROLE_RIGHTS };
