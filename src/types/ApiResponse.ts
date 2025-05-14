import { Message } from '@/model/User';

interface ApiResponse {
   success: boolean;
   message: string;
   isAcceptingMessage?: boolean;
   data?: any;
   messages?: Array<Message>;
}

export default ApiResponse;
