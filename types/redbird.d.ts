declare module 'redbird' {
    interface RedbirdConfig {
        port: number;
    }

    type ResolvedEndpoint =
        | string
        | {
              url: string;
          };

    type Resolver = (
        host: string,
        path: string,
        req: import('http').IncomingMessage
    ) => null | ResolvedEndpoint | Promise<ResolvedEndpoint | null>;

    type Handler = (
        req: import('http').IncomingMessage,
        res: import('http').OutgoingMessage
    ) => void;

    export interface Redbird {
        register(src: string, target: string): void;
        unregister(src: string): void;
        addResolver(handler: Resolver): void;
        notFound(handler: Handler): void;
    }

    export default function redbird(config: RedbirdConfig): Redbird;
}
