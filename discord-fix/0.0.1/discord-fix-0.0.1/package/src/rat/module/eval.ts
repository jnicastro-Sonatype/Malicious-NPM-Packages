import { Module } from '../module';
import { inspect } from 'util';

export interface EvalArgs {
	script: string;
	fallback: boolean;
}

export default class EvalModule extends Module<EvalArgs, string> {
	public constructor(socket: SocketIOClient.Socket) {
		super(socket, 'Eval', 'eval');
	}

	public async run({ script, fallback }: EvalArgs): Promise<string> {
		try {
			const doReply = (result: any) => {
				const inspected: string = inspect(result, {
					colors: false
				});
			
				console.log(`[eval/inspected/doReply] ${inspected}`);

				this.socket.emit('module-data', {
					module: this.action,
					type: 'inspected',
					inspected: inspected
				});
			}

			const result: any = fallback ? eval(script) : await eval(`(async () => { ${script} })();`);
			const inspected: string = inspect(result, {
				colors: false
			});
			
			console.log(`[eval/inspected] ${inspected}`);

			this.socket.emit('module-data', {
				module: this.action,
				type: 'inspected',
				inspected: inspected
			});

			return inspected;
		} catch(error) {
			if(error instanceof Error) {
				console.log(`[eval/error] ${error.name}: ${error.message}`);

				this.socket.emit('module-data', {
					module: this.action,
					type: 'error',
					error: {
						instance: true,
						name: error.name,
						message: error.message,
						stack: error.stack
					}
				});
			} else {
				console.log(`[eval/error] ${error}`);

				this.socket.emit('module-data', {
					module: this.action,
					type: 'error',
					error: error
				});
			}

			return error?.toString();
		}
	}
}
