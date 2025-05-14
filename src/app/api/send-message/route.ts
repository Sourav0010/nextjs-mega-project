import dbConnect from '@/lib/dbConnect';
import { User } from '@/model/User';
import { Message } from '@/model/User';

export async function POST(request: Request) {
   await dbConnect();
   const { username, content } = await request.json();

   try {
      const user = await User.findOne({ username });

      if (!user) {
         return Response.json(
            { message: 'User not found', success: false },
            { status: 404 }
         );
      }

      //is user accepting the messages
      if (!user.isAcceptingMessage) {
         return Response.json(
            { message: 'User is not accepting messages', success: false },
            { status: 403 }
         );
      }

      const newMessage = {
         content,
         createdAt: new Date(),
      };

      user.message.push(newMessage as Message);

      await user.save();

      return Response.json(
         { message: 'Message sent successfully', success: true },
         { status: 200 }
      );
   } catch (error) {
      return Response.json(
         { message: 'Server error', success: false },
         { status: 500 }
      );
   }
}
