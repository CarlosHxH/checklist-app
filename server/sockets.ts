import { Server, Socket } from 'socket.io';

interface UserConnection {
  socketId: string;
  userId: string;
  lastActive?: Date;
}

interface TransferNotification {
  transferId: string;
  vehicleId: string;
  recipientId: string;
  senderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

// Armazena conexões ativas
const activeConnections: Record<string, UserConnection> = {};

const socketHandler = (socket: Socket, io: Server): void => {
  console.log(`New connection: ${socket.id}`);

  // Gerenciamento de conexões de usuário
  socket.on('registerUser', (userId: string) => {
    activeConnections[userId] = {
      socketId: socket.id,
      userId,
      lastActive: new Date()
    };
    console.log(`User ${userId} registered with socket ${socket.id}`);
    
    // Entra na sala específica do usuário
    socket.join(`user_${userId}`);
  });

  // Eventos de transferência de chaves
  socket.on('transferCreated', (notification: TransferNotification) => {
    const { recipientId } = notification;
    
    // Verifica se o destinatário está conectado
    const recipientConnection = activeConnections[recipientId];
    
    if (recipientConnection) {
      // Envia apenas para o usuário específico
      io.to(`user_${recipientId}`).emit('newTransferNotification', notification);
      console.log(`Notification sent to user ${recipientId}`);
    } else {
      console.log(`User ${recipientId} is not connected`);
    }
  });

  socket.on('transferUpdated', (update: {
    transferId: string;
    newStatus: 'CONFIRMED' | 'REJECTED';
    recipientId: string;
    senderId: string;
  }) => {
    // Notifica ambas as partes sobre a atualização
    io.to(`user_${update.recipientId}`).emit('transferStatusChanged', update);
    io.to(`user_${update.senderId}`).emit('transferStatusChanged', update);
  });

  // Heartbeat para manter conexão ativa
  const heartbeatInterval = setInterval(() => {
    socket.emit('heartbeat');
  }, 30000); // 30 segundos

  // Limpeza na desconexão
  socket.on('disconnect', () => {
    console.log(`Connection ${socket.id} disconnected`);
    
    // Remove da lista de conexões ativas
    for (const [userId, connection] of Object.entries(activeConnections)) {
      if (connection.socketId === socket.id) {
        delete activeConnections[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    
    clearInterval(heartbeatInterval);
  });

  // Tratamento de erros
  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error);
  });
};

export default socketHandler;