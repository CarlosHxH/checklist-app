import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NEXTAUTH_URL || 'http://localhost';
const port = 80;

const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
	const server = createServer((req, res) => {
		const parsedUrl = parse(req.url || '', true);
		handle(req, res, parsedUrl);
	});

	const io = new Server(server);

	io.on('connection', (socket) => {
		console.log('A client connected ', socket.id);
		
		socket.on('req', (data: string) => {
			console.log('Message received:', data);
            socket.emit('res', data);
            io.to(socket.id).emit('res', data);
		});

		socket.on('disconnect', () => {
			console.log('A client disconnected');
		});
	});

	server.listen(port, (err?: Error) => {
		if (err) throw err;
		console.log(`> Ready on ${hostname}:${port}`);
	});
});
