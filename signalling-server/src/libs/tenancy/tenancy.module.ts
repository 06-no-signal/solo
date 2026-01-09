import { forwardRef, Module } from '@nestjs/common';
import { Request } from 'express';
import { ClsModule } from 'nestjs-cls';

import { TENANT_KEY } from './tenancy.constants';
import { TenancyController } from './tenancy.controller';
import { TenancyService } from './tenancy.service';
import { DatabaseModule } from 'src/libs/database/database.module';

@Module({
  imports: [
    forwardRef(() => DatabaseModule),
    ClsModule.forRoot({
      global: false,
      middleware: {
        mount: true,
        setup: (cls, req: Request) => {
          const tenantId = req.headers['tenant-id'];
          cls.set(TENANT_KEY, tenantId);
        },
      },
    }),
  ],
  providers: [TenancyService],
  controllers: [TenancyController],
  exports: [ClsModule, TenancyService],
})
export class TenancyModule {}
