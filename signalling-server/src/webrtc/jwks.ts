import jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtVerifierService {
  private client = jwksClient({
    jwksUri: `http://${process.env.KEYCLOAK_HOST}/realms/master/protocol/openid-connect/certs`,
    cache: true,
    rateLimit: true,
  });

  async verify(token: string): Promise<any> {
    const decoded = jwt.decode(token, { complete: true }) as any;
    if (!decoded?.header?.kid) {
      console.log('Token is missing kid');
      throw new Error('Missing kid');
    }

    const key = await this.client.getSigningKey(decoded.header.kid);
    const publicKey = key.getPublicKey();

    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });
  }
}
