'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { verifySchema } from '@/schemas/verifySchema';
import axios, { AxiosError } from 'axios';
import ApiResponse from '@/types/ApiResponse';
import {
   Form,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

const page = () => {
   const router = useRouter();
   const param = useParams<{ username: string }>();
   const { toast } = useToast();
   const form = useForm<z.infer<typeof verifySchema>>({
      // Resolver for the form from zod
      resolver: zodResolver(verifySchema),
      defaultValues: {
         code: '',
      },
   });

   const onSubmit = async (data: z.infer<typeof verifySchema>) => {
      try {
         const response = await axios.post('/api/verify-code', {
            username: param.username,
            code: data.code,
         });

         toast({
            title: 'Success',
            description: response.data.message,
         });
         router.replace('/sign-in');
      } catch (error) {
         const axiosError = error as AxiosError<ApiResponse>;
         let errorMessage = axiosError.response?.data?.message;
         toast({
            title: 'Verification Failed',
            description: errorMessage || 'Error verifying code',
            variant: 'destructive',
         });
      }
   };

   return (
      <div className='flex justify-center items-center min-h-screen bg-gray-100'>
         <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
            <div className='text-center'>
               <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>
                  Verify Your Account
               </h1>
               <p className='mb-4'>
                  Enter the verification code sent to your email
               </p>
            </div>
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
               >
                  <FormField
                     name='code'
                     control={form.control}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Verification Code</FormLabel>
                           <Input
                              {...field}
                              placeholder='Enter Your 6 digit Code'
                           />
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <Button type='submit'>Verify</Button>
               </form>
            </Form>
         </div>
      </div>
   );
};

export default page;
