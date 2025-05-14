import { User } from '@/model/User';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { usernameValidation } from '@/schemas/signUpSchema';

const UsernameQuerySchema = z.object({
   username: usernameValidation,
});

export async function GET(request: Request) {
   await dbConnect();

   try {
      // here how to extract querry
      const { searchParams } = new URL(request.url);

      const querryParams = {
         username: searchParams.get('username'),
      };

      // validate with zod
      const result = UsernameQuerySchema.safeParse(querryParams);


      if (!result.success) {
         let errorMessage = result.error.format().username?._errors || [];
         return Response.json(
            {
               message:
                  errorMessage.length > 0
                     ? errorMessage.join(', ')
                     : 'Invalid username',
               success: false,
            },
            { status: 400 }
         );
      }

      const { username } = result.data;

      const existingVerifiedUser = await User.findOne({
         username: username,
         isVerified: true,
      });

      if (existingVerifiedUser) {
         return Response.json(
            {
               message: 'Username already taken',
               success: false,
            },
            { status: 400 }
         );
      }

      return Response.json(
         {
            message: 'Username is available',
            success: true,
         },
         { status: 200 }
      );
   } catch (error) {
      console.log('Error while checking username', error);
      return Response.json(
         {
            message: 'Error while checking username',
            success: false,
         },
         { status: 500 }
      );
   }
}
