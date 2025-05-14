import { User as UserModel } from '@/model/User';
import { User as AuthUser, getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import authOptions from '../../auth/[...nextauth]/options';

export async function DELETE(
   request: Request,
   {
      params,
   }: {
      params: { messageid: string };
   }
) {
   const messageid = params.messageid;
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

   try {
      const updatedResult = await UserModel.updateOne(
         { _id: user._id },
         {
            $pull: {
               message: {
                  _id: new mongoose.Types.ObjectId(messageid),
               },
            },
         }
      );

      if (updatedResult.modifiedCount == 0) {
         return Response.json(
            {
               message: 'Message not found or already deleted',
               success: false,
            },
            { status: 404 }
         );
      }

      return Response.json(
         {
            message: 'Message deleted successfully',
            success: true,
         },
         { status: 200 }
      );
   } catch (error) {
      console.log('Error deleting message', error);
      return Response.json(
         {
            message: 'Internal server error while error deleting message',
            success: false,
         },
         { status: 500 }
      );
   }
}
