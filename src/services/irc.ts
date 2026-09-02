import { Client } from "irc-framework";

export default function connect(username: string, host: string, port: number) {
    const serverHost = host;
    const serverPort = port;
    if (serverPort <= 0 || serverPort > 65535) {
        throw new Error("Invalid port number");
    }
    if (!serverHost) {
        throw new Error("Invalid host");
    }
    const client = new Client();
    client.connect({
        host: serverHost,
        port: serverPort,
        nick: username
    });
    return client;
}

export function message(client: Client, channel: string, message: string) {
    client.say(channel, message);
}

export function join(client: Client, channel: string) {
    client.join(channel);
}

export function disconnect(client: Client) {
    client.quit();
}