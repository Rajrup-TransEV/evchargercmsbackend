import { RPCServer, createRPCError } from 'ocpp-rpc';

const server = new RPCServer({
    protocols: ['ocpp1.6'], // Specify the OCPP protocol version
    strictMode: true, // Enable strict validation of requests & responses
});

// Handle new client connections
server.on('client', async (client) => {
    console.log(`${client.identity} connected!`);

    // Handle BootNotification request
    client.handle('BootNotification', ({ params }) => {
        console.log(`BootNotification from ${client.identity}:`, params);
        return { status: "Accepted", interval: 300, currentTime: new Date().toISOString() };
    });

    // Handle Heartbeat request
    client.handle('Heartbeat', () => {
        return { currentTime: new Date().toISOString() };
    });

    // Handle MeterValues request
    client.handle('MeterValues', ({ params }) => {
        console.log(`Received MeterValues from ${client.identity}:`, params);
        // Process the meter values as needed
        return {};
    });

    // Handle other RPC methods not explicitly defined
    client.handle(({ method, params }) => {
        console.log(`Received ${method} from ${client.identity}:`, params);
        throw createRPCError("NotImplemented");
    });
});

// Start the server on the specified IP address and port
const ipAddress = '127.0.0.1'; // Replace with your desired IP address
const port = 80; // Replace with your desired port

await server.listen(port, ipAddress);
console.log(`OCPP server is listening on ws://${ipAddress}:${port}`);
