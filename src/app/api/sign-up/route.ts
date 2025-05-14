import dbConnect from '@/lib/dbConnect';
import { User } from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmails';

// The type Request comes from nextjs so don't worry about it
export async function POST(request: Request) {
   await dbConnect();

   try {
      // must include await while parsing the request body
      const { email, username, password } = await request.json();

      // check if user already exists and also verified by username
      const exisitingUserVerifiedByUserName = await User.findOne({
         username,
         isVerified: true,
      });
      // if user already exists with this username and verified then return error that user already exists
      if (exisitingUserVerifiedByUserName) {
         return Response.json(
            {
               success: false,
               message: 'User already exists with this username',
            },
            { status: 401 }
         );
      }

      // check for user with email if user already exists
      const existingUserByEmail = await User.findOne({ email });

      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      // if user already exists with email then update the password and verify code
      if (existingUserByEmail) {
         // if user is already verified then return error that user already exists
         if (existingUserByEmail.isVerified) {
            return Response.json(
               {
                  success: false,
                  message: 'User already exists with this email',
               },
               { status: 401 }
            );
         } else {
            // if user is not verified then update the password and verify code and save the current user
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(
               Date.now() + 3600000
            );

            await existingUserByEmail.save();
         }
      } else {
         // if user does not exists then create a new user
         const hashedPassword = await bcrypt.hash(password, 10);
         const expiryDate = new Date();
         expiryDate.setHours(expiryDate.getHours() + 1);

         const user = new User({
            email,
            username,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            isVerified: false,
            isAcceptingMessage: true,
            messages: [],
         });

         await user.save();
      }

      // send verification email 
      const response = await sendVerificationEmail(email, username, verifyCode);

      if (!response.success) {
         return Response.json(
            {
               success: false,
               message:
                  response.message || 'Error while sending verification email',
            },
            { status: 500 }
         );
      }

      return Response.json(
         {
            success: true,
            message: 'User registered successfully please verify email',
         },
         { status: 201 }
      );
   } catch (error) {
      console.error('Error while registering user', error);
      return Response.json(
         {
            success: false,
            message: 'Error while registering user',
         },
         { status: 500 }
      );
   }
}
