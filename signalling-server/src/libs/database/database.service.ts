import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';

import { Tenant } from 'src/libs/tenancy/entities/tenant.entity';
import { TENANT_KEY } from 'src/libs/tenancy/tenancy.constants';
import { DataSourceConfig } from './datasource.config';

@Injectable()
export class DatabaseService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private tenantConnections = new Map<string, DataSource>();
  private tenantMap = new Map<string, Tenant>();
  private defaultDataSource: DataSource;

  constructor(
    @Inject(DataSourceConfig.KEY)
    private readonly dataSourceConfig: ConfigType<typeof DataSourceConfig>,
    private readonly cls: ClsService,
  ) {}

  private get defaultConnectionOptions(): DataSourceOptions {
    return {
      type: this.dataSourceConfig.type,
      host: this.dataSourceConfig.host,
      username: this.dataSourceConfig.username,
      password: this.dataSourceConfig.password,
      database: this.dataSourceConfig.database,
      port: this.dataSourceConfig.port,
      logging: this.dataSourceConfig.logging,
      entities: [__dirname + '/../tenancy/**/*.entity{.ts,.js}'],
      migrations: [`${__dirname}/system-migrations/*{.ts,.js}`],
      migrationsRun: true,
      synchronize: false,
    };
  }

  private async initializeDefaultConnection() {
    this.defaultDataSource = new DataSource(this.defaultConnectionOptions);
    await this.defaultDataSource.initialize();
    this.logger.log('Default connection initialized');
  }

  async onModuleInit() {
    await this.initializeDefaultConnection();
    await this._createTenantConnections();
  }

  async onModuleDestroy() {
    for (const [tenantId, dataSource] of this.tenantConnections) {
      await dataSource.destroy();
      this.logger.log(`Closed connection for tenant ${tenantId}`);
    }
  }

  private _createConnectionString(tenant: Tenant): string {
    const connOptions = Object.assign(
      {},
      this.dataSourceConfig,
      Object.fromEntries(
        Object.entries({
          type: tenant.connectionType,
          host: tenant.host,
          port: tenant.port,
          username: tenant.username,
          password: tenant.password,
          database: tenant.database,
        }).filter(([_, value]) => !!value),
      ),
    );
    console.log(this.defaultConnectionOptions);
    console.log(connOptions);
    return `${connOptions.type}://${connOptions.username}:${connOptions.password}@${connOptions.host}:${connOptions.port}/${connOptions.database}`;
  }

  private async _createTenantConnections() {
    const tenantRepository: Repository<Tenant> =
      this.defaultDataSource.getRepository(Tenant);
    const tenants = await tenantRepository.find();

    this.logger.log(`Tenants found:\n${JSON.stringify(tenants, undefined, 2)}`);

    // Cache tenants for lookup by other services
    for (const t of tenants) {
      this.tenantMap.set(t.id, t);
    }

    for (const tenant of tenants) {
      const connectionsString = this._createConnectionString(tenant);
      await this._createTenantConnection(tenant, connectionsString);
    }

    await this.defaultDataSource.destroy();
    this.logger.log('Default connection closed');
  }

  /**
   * Get tenant entity by id from cached tenants
   */
  getTenantById(tenantId: string) {
    return this.tenantMap.get(tenantId);
  }

  private async _createTenantConnection(
    tenant: Tenant,
    connectionString: string,
  ) {
    await this._createDatabaseIfNotExists(tenant.database);

    const dataSourceOptions: DataSourceOptions = Object.assign(
      {},
      this.dataSourceConfig,
      {
        type:
          tenant.connectionType ?? (this.defaultConnectionOptions.type as any),
        url: connectionString,
        entities: [__dirname + '/../../db-components/**/*.entity{.ts,.js}'],
        migrations: [`${__dirname}/migrations/*{.ts,.js}`],
        logging: true,
      },
    );

    const dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();

    this.tenantConnections.set(tenant.id, dataSource);
    this.logger.log(`Initialized connection ${tenant.database}`);
  }

  private async _createDatabaseIfNotExists(database: string) {
    const result = await this.defaultDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = '${database}'`,
    );

    if (!result.length) {
      this.logger.log(`Creating database ${database}`);
      await this.defaultDataSource.query(`CREATE DATABASE ${database}`);
    }
  }

  /**
   * Get the data source for the current tenant
   */
  getDataSource() {
    const tenantId = this.cls.get(TENANT_KEY);

    if (!tenantId) {
      throw new HttpException('Tenant ID not provided', HttpStatus.BAD_REQUEST);
    }

    const out = this.tenantConnections.get(tenantId);

    if (!out) {
      this.logger.error(
        `Tenant not found: ${tenantId}, available tenants: ${[
          ...this.tenantConnections.keys(),
        ].join(', ')}`,
      );
      throw new HttpException(`Tenant not found ${out}`, HttpStatus.NOT_FOUND);
    }
    return out;
  }
}
