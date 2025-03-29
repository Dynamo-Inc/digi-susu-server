import { Op, Sequelize } from 'sequelize';
import User, { initUser } from './users';
import UserAccountMeta, { initUserAccountMeta } from './users-account-meta';
import UserLoginMeta, { initUserLoginMeta } from './users-login-meta';
import Token, { initToken } from './tokens';
import { NODE_ENV } from '../config';
import UserSession, { initUserSession } from './users-sessions';
import Group, { initSusuGroup } from './susu-group';
import Transaction, { initTransaction } from './transactions';
import SusuGroupMember, { initSusuGroupMember } from './group-members';

const env = NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];

const operatorsAliases = {
  gt: Op.gt,
  lt: Op.lt,
  in: Op.in,
  notIn: Op.notIn,
  eq: Op.eq,
  between: Op.between,
  regex: Op.regexp,
  contains: Op.contains,
  notContains: Op.notBetween,
};

export const sequelize = new Sequelize(config.database, config.username, config.password, {
  ...config,
  operatorsAliases,
  logging: false,
});

const models = {
  User: User,
  UserAccountMeta: UserAccountMeta,
  UserLoginMeta: UserLoginMeta,
  UserSession: UserSession,
  Token: Token,
  Group: Group,
  Transaction: Transaction,
  SusuGroupMember: SusuGroupMember,
};

//init models
export const initDb = (sequelize: Sequelize) => {
  initUser(sequelize);
  initUserAccountMeta(sequelize);
  initUserLoginMeta(sequelize);
  initToken(sequelize);
  initUserSession(sequelize);
  initSusuGroup(sequelize);
  initTransaction(sequelize);
  initSusuGroupMember(sequelize);

  // run the associations between models
  Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));
};
// sequelize.sync({ alter: isDev });

export const closeDb = (sequelize: Sequelize) => sequelize.close();

export { User, UserAccountMeta, UserLoginMeta, Token, UserSession, Group, Transaction, SusuGroupMember };
