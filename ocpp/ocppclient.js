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

// Function to send MeterValues
const sendMeterValues = async () => {
    const meterValue = {
        connectorId: 1, // Specify the connector ID if applicable
        transactionId: null, // Specify transaction ID if applicable
        meterValue: [
            {
                timestamp: new Date().toISOString(), // Current timestamp
                sampledValue: [
                    {
                        value: "123.45", // Example meter value
                        unit: "Wh" // Unit of measurement
                    }
                ]
            }
        ]
    };

    const meterValueResponse = await client.call('MeterValues', meterValue);
    console.log('MeterValues Response:', meterValueResponse);
};

// Periodically send MeterValues requests
setInterval(sendMeterValues, 60000); // Send every 60 seconds
