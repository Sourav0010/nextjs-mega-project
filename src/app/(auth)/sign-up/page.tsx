'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema'; //
import axios, { AxiosError } from 'axios';
import ApiResponse from '@/types/ApiResponse';
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const page = () => {
   // Sate for the username input
   const [username, setUsername] = useState('');
   // state for the username message if incase any error comes
   const [usernameMessage, setUsernameMessage] = useState('');
   // State for the checking username status like currently checking or not
   const [isCheckingUsername, setIsCheckingUsername] = useState(false);
   // State for the form submission status
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Debounce the username value
   const debounced = useDebounceCallback(setUsername, 500);

   const { toast } = useToast();

   const router = useRouter();

   // Form validation schema by zod
   const form = useForm<z.infer<typeof signUpSchema>>({
      // Resolver for the form from zod
      resolver: zodResolver(signUpSchema),
      // Default values for the form for the cleanup of the form
      defaultValues: {
         username: '',
         email: '',
         password: '',
      },
   });

   const checkUsernameUnique = async () => {
      if (username.length > 0) {
         setIsCheckingUsername(true);
         setUsernameMessage('');
         try {
            const response = await axios.get(
               `api/check-username-unique?username=${username}`
            );
            console.log(response);
            console.log(response);
            setUsernameMessage(response.data.message);
         } catch (error: any) {
            setUsernameMessage(error.response.data.message);
         } finally {
            setIsCheckingUsername(false);
         }
      }
   };

   useEffect(() => {
      checkUsernameUnique();
   }, [username]);

   const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
      setIsSubmitting(true);
      try {
         const response = await axios.post<ApiResponse>('/api/sign-up', data);
         console.log(response);
         toast({
            title: 'Success',
            description: response.data.message,
         });
         router.replace(`/verify/${username}`);
      } catch (error) {
         const axiosError = error as AxiosError<ApiResponse>;
         let errorMessage = axiosError.response?.data?.message;
         toast({
            title: 'Signup Failed',
            description: errorMessage || 'Error signing up',
            variant: 'destructive',
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className='flex justify-center items-center min-h-screen bg-gray-800'>
         <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
            <div className='text-center'>
               <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>
                  Join True Feedback
               </h1>
               <p className='mb-4'>Sign up to start your anonymous adventure</p>
            </div>
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
               >
                  <FormField
                     name='username'
                     control={form.control}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Username</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder='Enter Your Username'
                                 {...field}
                                 onChange={(e) => {
                                    // Here I watching the field value and updating the username state
                                    field.onChange(e);
                                    debounced(e.target.value);
                                 }}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  {isCheckingUsername && (
                     <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
                     </>
                  )}
                  {usernameMessage && (
                     <p
                        className={`text-sm ${
                           usernameMessage == 'Username is available'
                              ? 'text-green-600'
                              : 'text-red-600'
                        }`}
                     >
                        {usernameMessage}
                     </p>
                  )}
                  <FormField
                     name='email'
                     control={form.control}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Email</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder='Enter Your Email'
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     name='password'
                     control={form.control}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Password</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder='Enter Your Password'
                                 {...field}
                                 type='password'
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <Button type='submit' disabled={isSubmitting}>
                     {isSubmitting ? (
                        <>
                           <Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
                           Please wait
                        </>
                     ) : (
                        'Sign Up'
                     )}
                  </Button>
               </form>
            </Form>
            <div className='text-center mt-4'>
               <p>
                  Already a member?{' '}
                  <Link
                     href='/sign-in'
                     className='text-blue-600 hover:text-blue-800'
                  >
                     Sign in
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
};

export default page;
