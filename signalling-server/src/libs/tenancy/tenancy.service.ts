import { HttpException, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { TENANT_KEY } from './tenancy.constants';
import { TenantDto } from './tenancy.dto';
import { DatabaseService } from 'src/libs/database/database.service';

@Injectable()
export class TenancyService {
  constructor(
    private readonly cls: ClsService,
    private readonly databaseService: DatabaseService,
  ) {}

  getTenant(): TenantDto {
    const tenantId = this.cls.get(TENANT_KEY) as string | undefined;

    if (!tenantId) {
      throw new HttpException('Tenant ID not provided', 400);
    }

    const tenant = this.databaseService.getTenantById(tenantId);

    if (!tenant) {
      throw new HttpException('Tenant not found', 404);
    }

    return {
      id: tenant.id,
      name: tenant.name,
    };
  }
}
