

const chargercontroller = async () => {
    const chargerparams = {
        "uid": "o7f4bi",
        "connector_id": 1,
        "type": "Operative",
    };

    try {
        const API_URL = 'http://192.168.0.101:80/api/change_availability';
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(chargerparams)
        });
        
        if (!response.ok) {
            const errorData = await response.json(); // Get error details if available
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'No message'}`);
        }

        const data = await response.json();
        console.log('Response Data:', data);
        return data; // Return data for further use if needed
    } catch (error) {
        console.error('Error:', error);
    }
};
export default chargercontroller