import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    username: string;
    roles: string[];
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'games',
})
export class GamesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamesGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('Games Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.connectedUsers.delete(client.user.userId);
      this.logger.log(`Client disconnected: ${client.user.username}`);
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const payload = this.jwtService.verify(data.token, {
        secret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
      });

      client.user = {
        userId: payload.sub,
        username: payload.username,
        roles: payload.roles || [],
      };

      // Join user-specific room
      client.join(`user:${payload.sub}`);

      // Track connected user
      this.connectedUsers.set(payload.sub, client.id);

      this.logger.log(`User authenticated: ${payload.username}`);

      return { event: 'authenticated', data: { success: true, userId: payload.sub } };
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      client.disconnect();
      return { event: 'authentication_error', data: { message: 'Invalid token' } };
    }
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Not authenticated' } };
    }

    const roomName = `game:${data.gameId}`;
    client.join(roomName);

    this.logger.log(`User ${client.user.username} joined game ${data.gameId}`);

    // Notify others in the game
    client.to(roomName).emit('player_joined', {
      gameId: data.gameId,
      username: client.user.username,
    });

    return {
      event: 'joined_game',
      data: { gameId: data.gameId, players: this.getPlayersInRoom(roomName) },
    };
  }

  @SubscribeMessage('leave_game')
  async handleLeaveGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Not authenticated' } };
    }

    const roomName = `game:${data.gameId}`;
    client.leave(roomName);

    this.logger.log(`User ${client.user.username} left game ${data.gameId}`);

    // Notify others in the game
    client.to(roomName).emit('player_left', {
      gameId: data.gameId,
      username: client.user.username,
    });

    return { event: 'left_game', data: { gameId: data.gameId } };
  }

  @SubscribeMessage('place_bet')
  async handlePlaceBet(
    @MessageBody() data: { gameId: string; betData: any },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Not authenticated' } };
    }

    this.logger.log(`Bet placed by ${client.user.username} in game ${data.gameId}`);

    // Broadcast bet to all players in the game
    client.to(`game:${data.gameId}`).emit('bet_placed', {
      gameId: data.gameId,
      username: client.user.username,
      betData: data.betData,
      timestamp: new Date().toISOString(),
    });

    return { event: 'bet_acknowledged', data: { success: true } };
  }

  @SubscribeMessage('game_action')
  async handleGameAction(
    @MessageBody() data: { gameId: string; action: string; payload?: any },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      return { event: 'error', data: { message: 'Not authenticated' } };
    }

    // Forward action to game room
    client.to(`game:${data.gameId}`).emit('game_action', {
      gameId: data.gameId,
      username: client.user.username,
      action: data.action,
      payload: data.payload,
      timestamp: new Date().toISOString(),
    });

    return { event: 'action_acknowledged', data: { success: true } };
  }

  // Admin broadcast
  @SubscribeMessage('admin_broadcast')
  async handleAdminBroadcast(
    @MessageBody() data: { message: string; gameId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user || !client.user.roles.includes('admin')) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }

    const room = data.gameId ? `game:${data.gameId}` : 'games';
    this.server.to(room).emit('admin_message', {
      message: data.message,
      gameId: data.gameId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Admin broadcast: ${data.message}`);

    return { event: 'broadcast_sent', data: { success: true } };
  }

  // Helper methods
  private getPlayersInRoom(roomName: string): string[] {
    const room = this.server.sockets.adapter.rooms.get(roomName);
    if (!room) return [];

    const players: string[] = [];
    room.forEach((socketId) => {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket?.user) {
        players.push(socket.user.username);
      }
    });

    return players;
  }

  // Send game result to specific user
  sendGameResult(userId: string, result: any) {
    this.server.to(`user:${userId}`).emit('game_result', result);
  }

  // Send balance update to specific user
  sendBalanceUpdate(userId: string, balance: number) {
    this.server.to(`user:${userId}`).emit('balance_update', { balance, timestamp: new Date().toISOString() });
  }

  // Broadcast game state to all players in a game
  broadcastGameState(gameId: string, state: any) {
    this.server.to(`game:${gameId}`).emit('game_state', {
      gameId,
      state,
      timestamp: new Date().toISOString(),
    });
  }
}
