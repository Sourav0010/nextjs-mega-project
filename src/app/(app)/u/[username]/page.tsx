'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { messageSchema } from '@/schemas/messageSchema';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from 'next/dist/server/api-utils';
import { z } from 'zod';

const page = () => {
   const [messages, setMessages] = useState(
      'What’s something small that made you unexpectedly happy this week? || If you could instantly master any obscure skill, what would it be and why? || Have you ever had a moment where a stranger completely changed your day—for better or worse?'
   );
   const form = useForm<z.infer<typeof messageSchema>>({
      resolver: zodResolver(messageSchema),
      defaultValues: {
         content: '',
      },
   });

   const { toast } = useToast();
   const [loading, setLoading] = React.useState(false);

   const onSubmit = async (data: { content: string }) => {
      const { content } = data;
      try {
         const resopnse = await axios.post('/api/send-message', {
            content,
            username,
         });

         console.log(resopnse);
         if (resopnse.data.success) {
            form.reset();
         }

         toast({
            title: 'Message Sent',
            description: resopnse.data.message,
         });
      } catch (error) {
         const axiosError = error as AxiosError<ApiError>;
         console.log(error);
         toast({
            title: 'Error while sending message',
            description:
               axiosError?.response?.data.message ||
               'User not exist or user not accepting messages anymore',
            variant: 'destructive',
         });
      }
   };
   const { username } = useParams();

   const handleClick = async () => {
      setLoading(true);
      try {
         const response = await axios.post('/api/suggest-messages');
         setMessages(response.data.message);
      } catch (error) {
         console.log(error);
         toast({
            title: 'Error while generating message',
            description: 'Please try again later',
            variant: 'destructive',
         });
      } finally {
         setLoading(false);
      }
   };

   const handleButtonClick = (message: string) => {
      form.setValue('content', message);
   };

   return (
      <div className='container mx-auto my-8 p-6 bg-white rounded max-w-4xl'>
         <div>
            <h1 className='text-3xl font-bold mb-5'>Mystry Message</h1>
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-8'
               >
                  <FormField
                     control={form.control}
                     name='content'
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Enter Your Message Here</FormLabel>
                           <FormControl>
                              <Textarea {...field} />
                           </FormControl>
                           <FormDescription>
                              {`this message will be sent to ${username}`}
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <Button type='submit'>
                     <Send /> Send Message
                  </Button>
               </form>
            </Form>

            <div className='mt-7'>
               <h1 className=' font-bold text-xl'>AI Generated Messages</h1>
            </div>

            <div className='space-y-3 mt-4'>
               {messages.split('||').map((message, index) => (
                  <Card
                     key={index}
                     onClick={() => handleButtonClick(message)}
                     className='cursor-pointer w-auto'
                  >
                     <CardHeader className='m-0 px-2 py-2 w-auto'>
                        <CardTitle className='text-sm'>{message}</CardTitle>
                     </CardHeader>
                  </Card>
               ))}
               <Button onClick={handleClick} disabled={loading}>
                  <Sparkles />
                  Generate
               </Button>
            </div>

            <div className='mt-6 flex gap-3 justify-center items-center'>
               <h1 className=' font-bold text-md'>
                  Want to get Mystry Feedbacks
               </h1>
               <Link href={'/sign-up'}>
                  <Button className=''>
                     <Sparkles />
                     Get Feedbacks
                  </Button>
               </Link>
            </div>
         </div>
      </div>
   );
};

export default page;
