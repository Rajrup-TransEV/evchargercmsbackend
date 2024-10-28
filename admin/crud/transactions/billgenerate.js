//Generate billing 
//for testing usecase this is now sending as json array
const generatebill = async (req, res) => {
    const sample = [
        {
            "uid": "uin23b",
            "userid":"",
            "name": "Sujoy",
            "username": "sujoy",
            "walletid": "tty12e",
            "lasttransaction": "1000",
            "balancededuct": "1000",
            "energyconsumption": "50kva",
            "chargerid": "c34kp9",
            "location": "kolkata tala protoyprak",
            "chargingtime": "1hr 15 minutes"
        },
        {
            "uid": "uin34c",
            "name": "Aditi",
            "username": "aditi123",
            "walletid": "tty34f",
            "lasttransaction": "1500",
            "balancededuct": "500",
            "energyconsumption": "60kva",
            "chargerid": "c45kp0",
            "location": "mumbai bandra",
            "chargingtime": "2hr 30 minutes"
        },
        {
            "uid": "uin45d",
            "name": "Rahul",
            "username": "rahul_99",
            "walletid": "tty56g",
            "lasttransaction": "2000",
            "balancededuct": "1200",
            "energyconsumption": "40kva",
            "chargerid": "c56kp1",
            "location": "delhi connaught place",
            "chargingtime": "1hr 45 minutes"
        },
        {
            "uid": "uin56e",
            "name": "Priya",
            "username": "priya_88",
            "walletid": "tty67h",
            "lasttransaction": "800",
            "balancededuct": "300",
            "energyconsumption": "70kva",
            "chargerid": "c67kp2",
            "location": "bangalore koramangala",
            "chargingtime": "1hr 10 minutes"
        },
        {
            "uid": "uin67f",
            "name": "Ankit",
            "username": "_ankit_77",
            "walletid": "tty78i",
            "lasttransaction": "1200",
            "balancededuct": "600",
            "energyconsumption": "55kva",
            "chargerid": "_c78kp3_",
            "location":  "chennai adyar", 
            "chargingtime":"2hr 15 minutes"
        },
        {
            "uid":"uin78g", 
            "name":"Neha", 
            "username":"neha_singh", 
            "walletid":"tty89j", 
            "lasttransaction":"900", 
            "balancededuct":"400", 
            "energyconsumption":"65kva", 
            "chargerid":"c89kp4", 
            "location":"kolkata park street", 
            "chargingtime":"1hr 5 minutes"
        },
        {
            "uid":"uin89h", 
            "name":"Karan", 
            "username":"karan_123", 
            "walletid":"tty90k", 
            "lasttransaction":"1100", 
            "balancededuct":"700", 
            "energyconsumption":"75kva", 
            "chargerid":"c90kp5", 
            "location":"mumbai juhu", 
            "chargingtime":"2hr 5 minutes"
        },
        {
            "uid":"uin90i", 
            "name":"Riya", 
            "username":"riya_456", 
            "walletid":"tty01l", 
            "lasttransaction":"1300", 
            "balancededuct":"800", 
            "energyconsumption":"80kva", 
            "chargerid":"c01kp6", 
            "location":"delhi dwarka", 
              	"chargingtime":"1hr 20 minutes"
        },
        {
              	"uid":"uin01j", 
              	"name":"Vikram", 
              	"username":"vikram_789", 
              	"walletid":"tty12m", 
              	"lasttransaction":"1400", 
              	"balancededuct":"900",  
              	"energyconsumption":"85kva",  
              	"chargerid":"c12kp7",  
              	"location":"bangalore indiranagar",  
              	"chargingtime":"1hr 50 minutes"
        },
        {
             	"uid":"uin12k",  
             	"name":"Sita",  
             	"username":"sita_321",  
             	"walletid":"tty23n",  
             	"lasttransaction":"1150",  
             	"balancededuct":"550",  
             	"energyconsumption":"90kva",  
             	"chargerid":"c23kp8",  
             	"location":"chennai t nagar",  
             	"chargingtime":"2hr 25 minutes"
        },
        {
             	"uid":"uin23l",  
             	"name":"Ajay",  
             	"username":"ajay_6543",  
             	"walletid":"tty34o",  
             	"lasttransaction":"1250",  
             	"balancededuct":"650",  
             	"energyconsumption":"95kva",  
             	"chargerid":"c34kp9a",  
             	"location":"mumbai andheri east ",  
             	"chargingtime":"1hr 30 minutes"
        },
        {
             	"uid":"uin34m ",   
             	"name ":"Pooja ",   
             	"username ":"pooja_987 ",   
             	"walletid ":"tty45p ",   
             	"lasttransaction ":"1350 ",   
             	"balancededuct ":"750 ",   
             	"energyconsumption ":"100kva ",   
             	"chargerid ":"c45kp0b ",   
             	"location ":"kolkata salt lake ",   
             	"chargingtime ":"2hr "
        },
     ];

     res.status(200).json({message:"Transaction history",data:sample})
};
