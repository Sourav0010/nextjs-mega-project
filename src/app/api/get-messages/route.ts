import { getServerSession } from 'next-auth';
import authOptions from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import { User as UserModel } from '@/model/User';
import { User as AuthUser } from 'next-auth';
import mongoose from 'mongoose';

export async function GET(request: Request) {
   await dbConnect();
   const session = await getServerSession(authOptions);
   const user: AuthUser = session?.user as AuthUser;

   if (!session || !session.user) {
      return Response.json(
         {
            message: 'Unauthorized',
            success: false,
         },
         { status: 401 }
      );
   }

   const userId = new mongoose.Types.ObjectId(user._id);

   try {
      const currentUser = await UserModel.aggregate([
         {
            $match: {
               _id: userId,
            },
         },
         {
            $unwind: '$message',
         },
         {
            $sort: {
               'message.createdAt': -1,
            },
         },
         {
            $group: {
               _id: '$_id',
               message: {
                  $push: '$message',
               },
            },
         },
      ]);
      console.log(currentUser);

      if (Array.isArray(currentUser) && currentUser.length === 0) {
         return Response.json(
            {
               messages: [],
               success: true,
            },
            { status: 200 }
         );
      }

      return Response.json(
         {
            messages: currentUser[0].message,
            success: true,
         },
         { status: 200 }
      );
   } catch (error) {
      return Response.json(
         {
            message: 'Internal server error ',
            success: false,
         },
         { status: 500 }
      );
   }
}
