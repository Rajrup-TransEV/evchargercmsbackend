//email receipient verification
//check the given email is a bot mail or real mail
function validateEmailrecep(email) {
    // Regex pattern to match the email format
    const emailPattern =
        /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|protonmail\.com)$/;

    // Test the email against the regex pattern
    if (emailPattern.test(email)) {
        console.log("The email address is valid.");
        return true;
    } else {
        console.log(
            "The email address is invalid. Please use a valid email from gmail.com, outlook.com, or protonmail.com.",
        );
        return false;
    }
}
export default validateEmailrecep;
