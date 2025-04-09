import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<any[]>([]);

	useEffect(() => {
		const socketIo = io();

		socketIo.on('connect', () => {
			setIsConnected(true);
		});

		socketIo.on('disconnect', () => {
			setIsConnected(false);
		});

		socketIo.on('res', (data) => {
			setMessages((prevMessages) => [...prevMessages, data]);
		});

		setSocket(socketIo);

		return () => {
			socketIo.disconnect();
		};
	}, []);

	const sendMessage = (data: any, p0: never[]) => {
		if (socket) {
			socket.emit('req', data );
		}
	};

	return { isConnected, messages, sendMessage };
};
