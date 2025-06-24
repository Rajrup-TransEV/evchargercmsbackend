//charger operative cancel endpoint
import dotenv from "dotenv";
dotenv.config();

const EXTERNAL_URI = process.env.EXTERNAL_URI
const OCPP_API_KEY = process.env.OCPP_API_KEY;

if (!EXTERNAL_URI || !OCPP_API_KEY) {
  console.error("Environment variables are missing. Check your .env file.");
  process.exit(1);
}

const setChargerOn = async (req, res) => {
  const { chargerid, type } = req.body;
  const requestBody = {
    "uid": chargerid,
    "connector_id": "1",
    "type": type
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
      return res.status(500).json({ message: "Failed to communicate with the server", error: errorText });
    }

    try {
      const result = await response.json();
      if (result.status === "Accepted") {
        console.log("Charger is now operative.");
        return res.status(200).json({ message: "Charger is now operative", data: result });
      } else {
        console.error("Failed to start the charger:", result.error || "Unknown error");
        return res.status(400).json({ message: "Charger failed to start", error: result.error || "Unknown error" });
      }
    } catch (error) {
      const errorText = await response.text();
      console.error("Failed to parse JSON, server responded with:", errorText);
      return res.status(500).json({ message: "Failed to parse server response", error: errorText });
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Fetch error", error: error.message });
  }
};

export default setChargerOn;
