import Container, { Service } from 'typedi';
import { HttpException } from '../utils/httpException';
import httpStatus from 'http-status';
import { Group, sequelize, SusuGroupMember } from '../models';
import EmailService from './email.service';
import { customAlphabet } from 'nanoid';
import { CreateGroupDto } from '../dtos/susu-group.dto';
import dayjs from 'dayjs';
import { Op, Sequelize } from 'sequelize';

@Service()
export class GroupService {
  private email = Container.get(EmailService);

  public async findGroupById(groupId: string): Promise<Group> {
    const findGroup: any = await Group.findByPk(groupId);
    if (!findGroup) throw new HttpException(httpStatus.NOT_FOUND, 'Group not found');
    return findGroup;
  }

  public async createGroup(data: CreateGroupDto): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      const nanoid = customAlphabet('1234567890abcdef', 10);

      const group = await Group.create(
        {
          name: data.name,
          cycleDuration: data.cycleDuration,
          code: nanoid(8).toUpperCase(),
          contributionAmount: data.contributionAmount,
          frequency: data.frequency,
          creatorId: data.creatorId,
          enableAutoPayout: true,
          maxMembers: data.maxMembers,
          private: data.private,
          payoutMethod: 'mobile_money',
          status: 'pending',
        },
        { transaction },
      );

      await SusuGroupMember.create(
        {
          groupId: group.id,
          userId: data.creatorId,
          joinDate: new Date(),
          payoutPosition: null,
          status: 'pending',
        },
        { transaction },
      );
      await transaction.commit();
    } catch (e) {
      throw e;
    }
  }

  public async getGroupByCode(code: string): Promise<Group> {
    try {
      const group = await Group.findOne({
        where: { code },
        include: [
          {
            model: SusuGroupMember,
            as: 'members',
          },
        ],
      });

      if (!group) throw new HttpException(httpStatus.NOT_FOUND, 'Group not found');

      return group;
    } catch (e) {
      throw e;
    }
  }

  public async joinGroup(groupId: string, userId: string): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      const group = await Group.findByPk(groupId);

      if (!group) {
        throw new HttpException(httpStatus.NOT_FOUND, 'Group not found');
      }

      const alreadyMember = await SusuGroupMember.findOne({
        where: { groupId: group.id, userId },
      });

      if (alreadyMember) {
        throw new HttpException(httpStatus.CONFLICT, 'You already joined this group');
      }

      const currentMemberCount = await SusuGroupMember.count({
        where: { groupId: group.id },
      });

      if (currentMemberCount >= group.maxMembers) {
        throw new HttpException(httpStatus.BAD_REQUEST, 'Group is full');
      }

      const nextPosition = currentMemberCount + 1;

      await SusuGroupMember.create(
        {
          userId,
          groupId: group.id,
          payoutPosition: nextPosition,
          hasReceivedPayout: false,
          status: 'active',
        },
        { transaction },
      );

      if (nextPosition === group.maxMembers) {
        const startDate = new Date();

        await group.update({ startDate, status: 'in_progress' }, { transaction });

        const members = await SusuGroupMember.findAll({ where: { groupId: group.id } });

        for (const member of members) {
          const payoutDate = dayjs(startDate)
            .add(group.cycleDuration * (member.payoutPosition - 1), 'day')
            .toDate();

          await member.update({ payoutDate }, { transaction });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async activateCreatorMembership(groupCode: string, creatorId: string): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      const group = await Group.findOne({ where: { code: groupCode } });

      if (!group) throw new HttpException(httpStatus.NOT_FOUND, 'Group not found');
      if (group.creatorId !== creatorId) throw new HttpException(httpStatus.FORBIDDEN, 'Unauthorized');

      const member = await SusuGroupMember.findOne({
        where: { groupId: group.id, userId: creatorId },
      });

      if (!member) throw new HttpException(httpStatus.NOT_FOUND, 'Creator not registered as member');
      if (member.status === 'active') throw new HttpException(httpStatus.CONFLICT, 'Creator already active');

      await member.update(
        {
          payoutPosition: 1,
          status: 'active',
        },
        { transaction },
      );

      await group.update({ status: 'active' }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async getMyGroups(userId: string, pagination: { limit?: number; skip?: number }): Promise<Group[]> {
    try {
      const { limit, skip } = pagination;

      const groups = await Group.findAll({
        where: {
          id: {
            [Op.in]: Sequelize.literal(`(
              SELECT "group_id"
              FROM "susu_group_members"
              WHERE "user_id" = '${userId}'
            )`),
          },
        },
        include: [
          {
            model: SusuGroupMember,
            as: 'members',
            where: { userId },
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset: skip,
      });

      return groups;
    } catch (e) {
      throw e;
    }
  }

  public async getAllPublicGroups(pagination: { limit?: number; skip?: number }): Promise<Group[]> {
    try {
      const { limit, skip } = pagination;

      const groups = await Group.findAll({
        where: {
          private: false,
        },
        include: [
          {
            model: SusuGroupMember,
            as: 'members',
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset: skip,
      });

      return groups;
    } catch (e) {
      throw e;
    }
  }
}
