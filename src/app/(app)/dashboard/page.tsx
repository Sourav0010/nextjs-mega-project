'use client';

import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import ApiResponse from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const page = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

   const { toast } = useToast();

   const handleDeleteMessage = (messageId: string) => {
      setMessages(messages.filter((message) => message._id !== messageId));
   };

   const { data: session } = useSession();

   const form = useForm({
      resolver: zodResolver(acceptMessageSchema),
      defaultValues: {
         acceptMessages: true,
      },
   });

   const { register, watch, setValue } = form;

   const acceptMessages = watch('acceptMessages');

   const fetchAcceptMessage = useCallback(async () => {
      setIsLoading(true);
      try {
         const response = await axios.get<ApiResponse>('/api/accept-messages');

         setValue(
            'acceptMessages',
            response?.data.isAcceptingMessage as boolean
         );
      } catch (error) {
         const axiosError = error as AxiosError<ApiResponse>;
         console.log(axiosError.response?.data.message);
         toast({
            title: 'Error fetching accept message',
            description:
               axiosError.response?.data.message || 'An error occurred',
            variant: 'destructive',
         });
      } finally {
         setIsLoading(false);
      }
   }, [setValue, isLoading]);

   const fetchMessages = useCallback(
      async (refresh: boolean) => {
         setIsLoading(true);
         setIsSwitchLoading(true);
         try {
            const response = await axios.get<ApiResponse>('/api/get-messages');
            setMessages(response.data.messages || []);
            if (refresh) {
               toast({
                  title: 'Messages refreshed',
                  description: 'Showing latest messages',
               });
            }
         } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.log(axiosError.response?.data.message);
            toast({
               title: 'Error fetching messages',
               description:
                  axiosError.response?.data.message || 'An error occurred',
               variant: 'destructive',
            });
         } finally {
            setIsLoading(false);
            setIsSwitchLoading(false);
         }
      },
      [setIsLoading, setMessages]
   );

   useEffect(() => {
      if (!session || !session.user) return;
      fetchAcceptMessage();
      fetchMessages(acceptMessages);
   }, [session, setValue]);

   // handle switch change
   const handleSwitchChange = async () => {
      try {
         const response = axios.post<ApiResponse>('/api/accept-messages', {
            acceptMessages: !acceptMessages,
         });

         setValue('acceptMessages', !acceptMessages);
         toast({
            title: 'Accept message updated',
            description: 'Message accepting status updated',
         });
      } catch (error) {
         const axiosError = error as AxiosError<ApiResponse>;
         toast({
            title: 'Error updating accept message',
            description:
               axiosError.response?.data.message || 'An error occurred',
            variant: 'destructive',
         });
      }
   };

   const user = session?.user as User;

   const baseUrl = `${
      typeof window !== 'undefined' && window.location.protocol
   }//${typeof window !== 'undefined' && window.location.host}/u/${
      user?.username || ''
   }`;
   const profileUrl = baseUrl;


   const copyToClipboard = () => {
      navigator.clipboard.writeText(profileUrl);
      toast({
         title: 'Link copied',
         description: 'Your profile link has been copied to clipboard',
      });
   };

   if (!session || !session.user) return <div>Please Login</div>;

   return (
      <div className='my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl'>
         <h1 className='text-4xl font-bold mb-4'>User Dashboard</h1>

         <div className='mb-4'>
            <h2 className='text-lg font-semibold mb-2'>
               Copy Your Unique Link
            </h2>{' '}
            <div className='flex items-center'>
               <input
                  type='text'
                  value={profileUrl}
                  disabled
                  className='input input-bordered w-full p-2 mr-2'
               />
               <Button onClick={copyToClipboard}>Copy</Button>
            </div>
         </div>

         <div className='mb-4'>
            <Switch
               {...register('acceptMessages')}
               checked={acceptMessages}
               onCheckedChange={handleSwitchChange}
               disabled={isSwitchLoading}
            />
            <span className='ml-2'>
               Accept Messages: {acceptMessages ? 'On' : 'Off'}
            </span>
         </div>
         <Separator />

         <Button
            className='mt-4'
            variant='outline'
            onClick={(e) => {
               e.preventDefault();
               fetchMessages(true);
            }}
         >
            {isLoading ? (
               <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
               <RefreshCcw className='h-4 w-4' />
            )}
         </Button>
         <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {messages.length > 0 ? (
               messages.map((message) => (
                  <MessageCard
                     key={message._id as string}
                     message={message}
                     onMessageDelete={handleDeleteMessage}
                  />
               ))
            ) : (
               <p>No messages to display.</p>
            )}
         </div>
      </div>
   );
};

export default page;
