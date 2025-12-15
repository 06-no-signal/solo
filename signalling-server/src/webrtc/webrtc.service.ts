import { Injectable } from '@nestjs/common';

@Injectable()
export class WebrtcService {
  private clients = new Set<string>();

  addClient(id: string) {
    this.clients.add(id);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }
}
