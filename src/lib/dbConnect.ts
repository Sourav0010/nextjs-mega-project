import mongoose from 'mongoose';

// here we are defining the connection object type
type ConnectionObject = {
   isConnected?: number; // optional
};

// here we are defining the connection object to track that if database is already connected or not
const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
   // here we are mentioning the return type of the function
   if (connection.isConnected) {
      console.log('Using existing connection');
      return;
   }

   // here we are connecting to the database if the connection is not already established
   try {
      const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
      // here we are extracting the readyState of the connection
      connection.isConnected = db.connections[0].readyState;

      console.log('DB Connected Successfully');
   } catch (error: any) {
      console.log('DB Connection Error:', error);
      // here we are exiting the process if the connection is not established
      process.exit(1);
   }
}

export default dbConnect;
