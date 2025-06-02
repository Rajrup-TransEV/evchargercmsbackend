const chargerstop = async (req,res)=>{
    const {transactionid,metervalue,unit}=req.body
    if(!transactionid||!metervalue||!unit){
        return res.status(400).json({message:"sorry current transaction data is incomplete"})
    }
}

export default chargerstop