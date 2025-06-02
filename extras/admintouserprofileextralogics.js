    
        // const userData = {
        //     uid: createadminprofile.uid,
        //     firstname: createadminprofile.firstname,
        //     lastname: createadminprofile.lastname,
        //     email: createadminprofile.email,
        //     phonenumber: createadminprofile.phonenumber,
        //     role: createadminprofile.role,
        //     designation: createadminprofile.designation,
        //     address: createadminprofile.address
        // };
    
    // const externaluri = process.env.EXTERNAL_URI
    // const concaturi = externaluri + "/users"
    // try {
    //     const response = await fetch(`${concaturi}`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(userData)
    //     });
        
    //     if (!response.ok) {
    //         const errorData = await response.json();
    //         const messagetype = "error"
    //         const message = "Error sending data to Flask API:"
    //         const filelocation = "admin_to_user_profile_create.js"
    //         logging(messagetype,message,filelocation)
    //         console.error('Error sending data to Flask API:', errorData.error);
    //     } else {
    //         const createdUser = await response.json();
    //         const messagetype = "success"
    //         const message = "User created in Flask:"
    //         const filelocation = "admin_to_user_profile_create.js"
    //         logging(messagetype,message,filelocation)
    //         console.log('User created in Flask:', createdUser);
    //     } 
    // } catch (error) {
    //     const messagetype = "success"
    //     const message = `message:"api endpoint is down -> still userdata hasbeen generated ",error:${error}`
    //     const filelocation = "admin_to_user_profile_create.js"
    //     logging(messagetype,message,filelocation)
    //     return res.status(201).json({message:"api endpoint is down still userdata hasbeen generated ",error:error})
    // }