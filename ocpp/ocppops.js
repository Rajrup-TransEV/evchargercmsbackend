import { RPCServer, createRPCError } from 'ocpp-rpc';

const server = new RPCServer({
    protocols: ['ocpp2.0.1'], // Specify the OCPP protocol version
    strictMode: true, // Enable strict validation of requests & responses
});

// Function to check if battery is full
const isBatteryFull = (meterValues) => {
    // Assuming meterValues contains a field 'stateOfCharge' in percentage
    const stateOfCharge = meterValues.find(value => value.measurand === 'StateOfCharge');
    return stateOfCharge && stateOfCharge.value >= 100; // Check if SoC is 100% or more
};

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

        // Check if the battery is full based on received meter values
        const batteryFull = isBatteryFull(params.meterValue);
        if (batteryFull) {
            console.log(`Battery is full for ${client.identity}`);
            // Additional logic could be added here, such as stopping the charging process
        } else {
            console.log(`Battery is not full for ${client.identity}`);
        }

        // Process the meter values as needed
        return {
            status: 'Accepted', // Indicate that the MeterValues were accepted
            currentTime: new Date().toISOString(), // Optional: include current time
            transactionId: params.meterValue[0].transactionId || null // Include transaction ID if applicable
        }
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
