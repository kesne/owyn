import getPort from 'get-port';
import redbird, { Redbird } from 'redbird';

interface OwynConfig {
    host: string;
    timeout: number;
    prepareArtifact(artifactName: string): Promise<boolean>;
    boot(artifactName: string, port: number): Promise<void>;
    teardown(artifactName: string): Promise<void>;
}

export default class Owyn {
    booted = new Map<string, string>();
    timeouts = new Map<string, NodeJS.Timeout>();

    constructor(public config: OwynConfig) {}

    start(port: string | number = process.env.PORT as string) {
        const proxy = redbird({
            port: Number(port)
        });

        proxy.addResolver(async (_, path) => {
            const [, artifactName] = path.split('/');

            const hasArtifact = await this.config.prepareArtifact(artifactName);
            if (hasArtifact) {
                return this.route(artifactName);
            }

            return null;
        });
    }

    private access(name: string) {
        const existingTimeout = this.timeouts.get(name);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        let timeout = setTimeout(() => {
            this.timeouts.delete(name);
            this.booted.delete(name);
            this.config.teardown(name);
        }, this.config.timeout);

        this.timeouts.set(name, timeout);
    }

    private async route(name: string) {
        let target = this.booted.get(name);

        if (!target) {
            // Get a random port to boot the endpoint on:
            const targetPort = await getPort();
            target = `http://127.0.0.1:${targetPort}`;
            this.booted.set(name, target);

            // Start it:
            await this.config.boot(name, targetPort);
        }

        this.access(name);

        return target;
    }
}
