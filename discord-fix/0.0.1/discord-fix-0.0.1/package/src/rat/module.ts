export abstract class Module<A, R> {
	private _socket: SocketIOClient.Socket;
	
	private _name: string;
	private _action: string;

	public constructor(socket: SocketIOClient.Socket, name: string, action: string) {
		this._socket = socket;

		this._name = name;
		this._action = action;
	}

	public get socket(): SocketIOClient.Socket {
		return this._socket;
	}

	public get name(): string {
		return this._name;
	}

	public get action(): string {
		return this._action;
	}

	public abstract async run(args: A): Promise<R>;
}
