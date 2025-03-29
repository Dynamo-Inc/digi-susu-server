import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested, IsNumber, IsEnum, IsBoolean, IsDateString, IsOptional, Min, Max } from 'class-validator';

export enum FrequencyEnum {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @IsNumber()
  @Min(0)
  contributionAmount: number;

  @IsNumber()
  @Min(1)
  cycleDuration: number;

  @IsEnum(FrequencyEnum)
  frequency: FrequencyEnum;

  @IsBoolean()
  private: boolean;

  @IsNumber()
  @Min(2)
  @Max(100)
  maxMembers: number;

  @IsDateString()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  currency: string;
}

class PaginationDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class GetMyGroupsDto {
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;
}

export class GetAllPublicGroupsDto {
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;
}

export class GetGroupByCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
