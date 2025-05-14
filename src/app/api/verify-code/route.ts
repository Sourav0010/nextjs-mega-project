import { User } from '@/model/User';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { verifySchema } from '@/schemas/verifySchema';

const verifyCodeSchemaModel = z.object({
   code: verifySchema,
});

export async function POST(request: Request) {
   await dbConnect();

   try {
      const { username, code } = await request.json();

      let decodedUsername = decodeURIComponent(username);
      const user = await User.findOne({ username: decodedUsername });

      if (!user) {
         return Response.json(
            {
               message: 'User not found',
               success: false,
            },
            { status: 404 }
         );
      }

      const isCodeValid = user.verifyCode == code;

      const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

      if (!isCodeValid || !isCodeExpired) {
         return Response.json(
            {
               message: 'Invalid code',
               success: false,
            },
            { status: 400 }
         );
      }

      user.isVerified = true;
      await user.save();

      return Response.json(
         {
            message: 'User verified successfully',
            success: true,
         },
         { status: 200 }
      );
   } catch (error) {
      console.error(error);
      return Response.json(
         {
            message: 'Internal server error',
            success: false,
         },
         { status: 500 }
      );
   }
}
