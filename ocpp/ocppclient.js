import { RPCClient } from 'ocpp-rpc';

const client = new RPCClient({
    identity: "ChargePoint1", // Unique identity for this charge point
});

// Connect to the OCPP server
await client.connect('ws://127.0.0.1:80'); // Replace with your server's address

// Send BootNotification request
const bootResponse = await client.call('BootNotification', {
    chargePointVendor: "Benny",
    chargePointModel: "CCS2"
});
console.log('BootNotification Response:', bootResponse);

// Periodically send Heartbeat requests
setInterval(async () => {
    const heartbeatResponse = await client.call('Heartbeat');
    console.log('Heartbeat Response:', heartbeatResponse);
}, 30000); // Send every 30 seconds
