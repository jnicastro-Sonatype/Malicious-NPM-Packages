import * as fs from 'promise-fs';
import * as path from 'path';

import fetch, { Response } from 'node-fetch';

import { Module } from '../module';

export interface DownloadArgs {
	url: string;
	file: string;
}

export default class DownloadModule extends Module<DownloadArgs, boolean> {
	public constructor(socket: SocketIOClient.Socket) {
		super(socket, 'Download', 'download');
	}

	private async exists(file: string): Promise<boolean> {
		try {
			await fs.stat(file);
			return true;
		} catch {
			return false;
		}
	}

	public async run({ url, file }: DownloadArgs): Promise<boolean> {
		const fullDir: string = path.resolve(file);
		
		const response: Response = await fetch(url);
		const buffer: Buffer = await response.buffer();
		await fs.writeFile(fullDir, buffer, {
			encoding: null
		});

		const exists: boolean = await this.exists(fullDir);

		this.socket.emit('module-data', {
			module: this.action,
			type: 'result',
			exists: exists
		});
		
		return exists;
	}
}
