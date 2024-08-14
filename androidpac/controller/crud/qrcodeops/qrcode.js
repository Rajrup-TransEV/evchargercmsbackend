import qrcode from "qrcode"



const generateqrcode  = async (req,res)=>{
    try {
        const data = "myname is"
        const qrcodeurl = await qrcode.toDataURL(data)
        return res.status(200).json({qrcodeurl})
    } catch (error) {
        console.log(error)
    }
}

export default generateqrcode;