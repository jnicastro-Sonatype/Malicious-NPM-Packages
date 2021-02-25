import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';

import { Module } from '../module';

export interface ExecuteArgs {
	command: string;
	args: string[];
	detached: boolean;
	hide: boolean;
}

export class ExecuteStream {
	public stdout: Readable;
	public stderr: Readable;

	public constructor(stdout: Readable, stderr: Readable) {
		this.stdout = stdout;
		this.stderr = stderr;
	}
}

export default class ExecuteModule extends Module<ExecuteArgs, ExecuteStream> {
	public constructor(socket: SocketIOClient.Socket) {
		super(socket, 'Execute', 'execute');
	}

	public async run({ command, args, detached, hide }: ExecuteArgs): Promise<ExecuteStream> {
		const spawned: ChildProcess = spawn(command, args, {
			detached: detached,
			windowsHide: hide,
			stdio: [
				'ignore',
				'pipe'
			]
		});
		
		const stream: ExecuteStream = new ExecuteStream(
			spawned.stdout || new Readable(),
			spawned.stderr || new Readable()
		);

		stream.stdout.on('data', (rawData: { toString: () => string }) => {
			const data: string = rawData.toString();
			console.log(`[child/stdout] ${data}`);

			this.socket.emit('module-data', {
				module: this.action,
				type: 'stdout',
				data: data
			});
		});

		stream.stderr.on('data', (rawData: { toString: () => string }) => {
			const data: string = rawData.toString();
			console.log(`[child/stderr] ${data}`);

			this.socket.emit('module-data', {
				module: this.action,
				type: 'stderr',
				data: data
			});
		});

		return stream;
	}
}
