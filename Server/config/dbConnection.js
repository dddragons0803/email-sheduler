const mongoose = require('mongoose')

const connectDb = async ()=>{
    try {
        const connect =await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB connected',connect.Collection.name,connect.connection.host);
    } catch (err) {
        console.log(err)
        process.exit(1);
    }
}

module.exports = connectDb;