//generate random uid for chargers 

function generateCustomRandomUID() {
    // Define the characters to choose from: lowercase letters and digits
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let uid = '';
  
    // Generate a 6-character random UID
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uid += characters[randomIndex];
    }
  
    return uid;
  }

  export default generateCustomRandomUID
  