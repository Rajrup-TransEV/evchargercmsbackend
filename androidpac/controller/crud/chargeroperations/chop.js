import dotenv from "dotenv";
dotenv.config();

const EXTERNAL_URI = "http://hal.ocpp.transev.site";
const OCPP_API_KEY = "J9YtyNYdbLD8N4qMwU2WQrr9XV2SJn4Q3qrCLEcHa8wwaZC34xhAd3RotuYdHwiB";

if (!EXTERNAL_URI || !OCPP_API_KEY) {
  console.error("Environment variables are missing. Check your .env file.");
  process.exit(1);
}

const setChargerOn = async () => {
  const requestBody = {
    "uid": "6nvvs3",
    "connector_id": "1",
    "type": "Operative"
  };

  try {
    const response = await fetch(`${EXTERNAL_URI}/api/change_availability`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": OCPP_API_KEY
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with:", response.status, errorText);
      return;
    }

    try {
      const result = await response.json();
      console.log(result);
    } catch (error) {
      const errorText = await response.text();
      console.error("Failed to parse JSON, server responded with:", errorText);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

export default setChargerOn;
