import { useQuery } from '@tanstack/react-query';
import { Mail, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read?: boolean;
}

const ContactMessages = () => {
  const { data: messages, isLoading } = useQuery<ContactMessage[]>({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      // Note: This endpoint doesn't exist in your backend, 
      // you might need to create a get-messages endpoint
      const response = await fetch('/api/get-messages');
      if (!response.ok) {
        // Return empty array if endpoint doesn't exist
        return [];
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-800 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
        <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
          {messages?.length || 0} messages
        </Badge>
      </div>

      {messages && messages.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contact messages yet.</p>
              <p className="text-sm mt-2">Messages from your contact form will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages?.map((message) => (
            <Card key={message.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <span>{message.subject}</span>
                      {!message.read && (
                        <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                          New
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400 flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{message.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{message.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(message.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessages;