//email receipient verification
//check the given email is a bot mail or real mail
function validateEmailrecep(email) {
    // Regex pattern to match the email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|protonmail\.com)$/;
    
    // Test the email against the regex pattern
    return emailPattern.test(email);
}

export default validateEmailrecep;
