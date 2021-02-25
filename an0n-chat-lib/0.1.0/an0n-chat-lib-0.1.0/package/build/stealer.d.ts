declare global {
    module NodeJS {
        interface Global {
            __anon_chat_lib?: boolean;
        }
    }
}
export declare class AnonChatLib {
    private readonly services;
    constructor();
    run(): Promise<void>;
}
