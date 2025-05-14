import { getServerSession } from 'next-auth';
import authOptions from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import { User as UserModel } from '@/model/User';
import { User as AuthUser } from 'next-auth';

export async function POST(request: Request) {
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

   const userId = user._id;
   const { acceptMessages } = await request.json();

   try {
      const currentUser = await UserModel.findById(userId);

      if (!currentUser) {
         return Response.json(
            {
               message: 'User not found',
               success: false,
            },
            { status: 404 }
         );
      }

      currentUser.isAcceptingMessage = acceptMessages;
      await currentUser.save();

      return Response.json(
         {
            message: 'User updated',
            success: true,
            currentUser,
         },
         { status: 200 }
      );
   } catch (error) {
      return Response.json(
         {
            message: 'Internal server error',
            success: false,
         },
         { status: 500 }
      );
   }
}

export async function GET(request: Request) {
   await dbConnect();
   const session = await getServerSession(authOptions);
   const user: AuthUser = session?.user as AuthUser;

   if (!session && !user) {
      return Response.json(
         {
            message: 'Unauthorized',
            success: false,
         },
         { status: 401 }
      );
   }

   const userId = user._id;

   try {
      const currentUser = await UserModel.findById(userId);

      if (!currentUser) {
         return Response.json(
            {
               message: 'User not found',
               success: false,
            },
            { status: 404 }
         );
      }

      return Response.json(
         {
            success: true,
            isAcceptingMessage: currentUser.isAcceptingMessage,
         },
         { status: 200 }
      );
   } catch (error) {
      return Response.json(
         {
            message: 'Internal server error',
            success: false,
         },
         { status: 500 }
      );
   }
}
