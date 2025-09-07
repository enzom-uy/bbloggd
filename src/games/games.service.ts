import { Injectable } from '@nestjs/common';

@Injectable()
export class GamesService {
  async searchGames(gameName: string) {
    // Aquí irá tu lógica para buscar juegos
    // Por ahora, solo devolvemos un mensaje
    return {
      message: `Searching for games with name: ${gameName}`,
      query: gameName
    };
  }

  create(createGameDto) {
    return 'This action adds a new game';
  }

  findAll() {
    return `This action returns all games`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
