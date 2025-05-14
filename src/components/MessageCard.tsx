'use client';
import {
   Card,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@/components/ui/card';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash, Trash2, X } from 'lucide-react';
import { Message } from '@/model/User';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
type MessageCardProps = {
   message: Message;
   onMessageDelete: (messageId: string) => void;
};
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
   const { toast } = useToast();

   async function handleDeleteConfirm() {
      onMessageDelete(message._id as string);
      const response = await axios.delete(`/api/delete-message/${message._id}`);

      toast({
         title: response.data.message,
      });
   }

   return (
      <Card>
         <CardHeader className='flex justify-between flex-col md:flex-row'>
            <div className='flex flex-col gap-2'>
               <CardTitle className='text-md'>{message.content}</CardTitle>
               <CardDescription className='text-sm text-muted-foreground'>
                  {'Unknown'}
               </CardDescription>
            </div>

            <AlertDialog>
               <AlertDialogTrigger asChild>
                  <Button variant='destructive' className='w-8'>
                     <Trash2 className='h-4 w-4' />
                  </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle>
                        Are you absolutely sure?
                     </AlertDialogTitle>
                     <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete message and remove your data from our servers.
                     </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                     <AlertDialogAction onClick={handleDeleteConfirm}>
                        Delete
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </CardHeader>
      </Card>
   );
};

export default MessageCard;
