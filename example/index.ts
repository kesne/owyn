import http from 'http';
import Owyn from '../src';

let servers = new Map<string, http.Server>();

setInterval(() => {
    console.log('CURRENT SERVERS: ', [...servers.keys()].join(', '));
}, 3000);

function startServer(name: string, port: number) {
    return new Promise((resolve) => {
        const server = http.createServer((_, res) => {
            res.end(name);
        });
        servers.set(name, server);
        console.log('listening...');
        server.listen(port, resolve);
    });
}

function stopServer(name: string) {
    return new Promise((resolve) => {
        let server = servers.get(name);
        if (server) {
            servers.delete(name);
            server.close(resolve);
        }
    });
}

new Owyn({
    host: '127.0.0.1:8080',
    // Tear down servers after 30 seconds of no requests:
    timeout: 30 * 1000,
    // There is no prepare step for this local server example:
    async prepareArtifact() {
        return true;
    },
    async boot(artifactName, port) {
        await startServer(artifactName, port);
    },
    async teardown(artifactName) {
        await stopServer(artifactName);
    }
}).start(8080);
