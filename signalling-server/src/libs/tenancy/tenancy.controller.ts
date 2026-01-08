import { Controller, Get } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { TenantDto } from './tenancy.dto';

@Controller('tenant')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Get()
  getTenant(): TenantDto {
    return this.tenancyService.getTenant();
  }
}
