import mongoose from "mongoose";


const whatsapp_schema=mongoose.Schema({
    message: String,
    name: String,
    timestamp:String,
    received:Boolean
})

export default mongoose.model('messagecontents',whatsapp_schema);