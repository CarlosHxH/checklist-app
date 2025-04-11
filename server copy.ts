import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocket } from 'ws';

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

	// Configurando o servidor WebSocket
	const wss = new WebSocket.Server({ server });

	wss.on('connection', (ws) => {
		console.log('Cliente conectado');

		ws.on('message', (message) => {
			console.log('Mensagem recebida:', message.toString());

			// Enviar a mensagem para todos os clientes conectados
			wss.clients.forEach((client) => {
				if (client !== ws && client.readyState === WebSocket.OPEN) {
					client.send(message.toString());
				}
			});
		});

		ws.on('close', () => {
			console.log('Cliente desconectado');
		});
	});

	server.listen(port, (err?: Error) => {
		if (err) throw err;
		console.log(`> Ready on ${hostname}:${port}`);
	});
});