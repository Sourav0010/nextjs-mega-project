'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
import { signInSchema } from '@/schemas/signInSchema';
import { signIn } from 'next-auth/react';

const page = () => {
   // State for the form submission status
   const [isSubmitting, setIsSubmitting] = useState(false);

   const { toast } = useToast();

   const router = useRouter();

   // Form validation schema by zod
   const form = useForm<z.infer<typeof signInSchema>>({
      // Resolver for the form from zod
      resolver: zodResolver(signInSchema),
      // Default values for the form for the cleanup of the form
      defaultValues: {
         identifier: '',
         password: '',
      },
   });

   const onSubmit = async (data: z.infer<typeof signInSchema>) => {
      setIsSubmitting(true);
      const result = await signIn('credentials', {
         redirect: false,
         identifier: data.identifier,
         password: data.password,
      });

      if (result?.error) {
         toast({
            title: 'Login Filed',
            description: 'Incorrect username or password',
            variant: 'destructive',
         });
      }
      setIsSubmitting(false);
      router.push('/dashboard');
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
                     name='identifier'
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
                        'Sign In'
                     )}
                  </Button>
               </form>
            </Form>
            <div className='text-center mt-4'>
               <p>
                  Don't have account?{' '}
                  <Link
                     href='/sign-up'
                     className='text-blue-600 hover:text-blue-800'
                  >
                     Sign up
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
};

export default page;
