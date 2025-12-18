/**
 * PrivateMessage Component
 * 
 * Private messaging feature for community users
 */

import { useState, useEffect } from 'react';

interface Message {
    id: string;
    from: string;
    fromAvatar: string;
    content: string;
    timestamp: Date;
    read: boolean;
}

interface Conversation {
    userId: string;
    nickname: string;
    avatar: string;
    lastMessage: string;
    lastTime: Date;
    unread: number;
}

// Mock conversations
const MOCK_CONVERSATIONS: Conversation[] = [
    { userId: '1', nickname: '正能量小太阳', avatar: '🌟', lastMessage: '谢谢你的鼓励！', lastTime: new Date(), unread: 2 },
    { userId: '2', nickname: '心灵守护者', avatar: '💜', lastMessage: '最近感觉好多了', lastTime: new Date(Date.now() - 3600000), unread: 0 },
    { userId: '3', nickname: '微笑面对', avatar: '😊', lastMessage: '一起加油！', lastTime: new Date(Date.now() - 86400000), unread: 1 },
];

// Mock messages for a conversation
const MOCK_MESSAGES: Message[] = [
    { id: '1', from: 'them', fromAvatar: '🌟', content: '你好！看到你的帖子很有共鸣', timestamp: new Date(Date.now() - 7200000), read: true },
    { id: '2', from: 'me', fromAvatar: '😊', content: '谢谢！很高兴认识你', timestamp: new Date(Date.now() - 3600000), read: true },
    { id: '3', from: 'them', fromAvatar: '🌟', content: '我们可以互相支持！', timestamp: new Date(Date.now() - 1800000), read: true },
    { id: '4', from: 'them', fromAvatar: '🌟', content: '谢谢你的鼓励！', timestamp: new Date(), read: false },
];

interface PrivateMessageProps {
    onClose?: () => void;
    preSelectedUser?: string | null;  // Auto-select conversation by user name
}

export const PrivateMessage = ({ onClose, preSelectedUser }: PrivateMessageProps) => {
    const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [newMessage, setNewMessage] = useState('');

    // Auto-select conversation if preSelectedUser is provided
    useEffect(() => {
        if (preSelectedUser) {
            const targetConv = conversations.find(c => c.nickname === preSelectedUser);
            if (targetConv) {
                setSelectedConversation(targetConv);
            } else {
                // Create new conversation for this user if not exists
                const newConv: Conversation = {
                    userId: Date.now().toString(),
                    nickname: preSelectedUser,
                    avatar: '💭',
                    lastMessage: '开始新对话...',
                    lastTime: new Date(),
                    unread: 0,
                };
                setSelectedConversation(newConv);
            }
        }
    }, [preSelectedUser, conversations]);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        return `${Math.floor(diff / 86400000)}天前`;
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const msg: Message = {
            id: Date.now().toString(),
            from: 'me',
            fromAvatar: '😊',
            content: newMessage.trim(),
            timestamp: new Date(),
            read: true,
        };

        setMessages([...messages, msg]);
        setNewMessage('');
    };

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-rose-500 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">💌</span>
                    <div>
                        <h2 className="font-bold text-lg">私信</h2>
                        {totalUnread > 0 && (
                            <span className="text-xs text-white/80">{totalUnread} 条未读消息</span>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Conversation List */}
                <div className="w-1/3 border-r border-warm-200 dark:border-gray-700 overflow-y-auto">
                    {conversations.map((conv) => (
                        <div
                            key={conv.userId}
                            onClick={() => setSelectedConversation(conv)}
                            className={`p-4 border-b border-warm-100 dark:border-gray-700 cursor-pointer hover:bg-warm-50 dark:hover:bg-gray-700 transition-colors ${selectedConversation?.userId === conv.userId ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-xl relative">
                                    {conv.avatar}
                                    {conv.unread > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {conv.unread}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-warm-800 dark:text-white truncate">{conv.nickname}</h3>
                                        <span className="text-xs text-warm-400 dark:text-gray-500">{formatTime(conv.lastTime)}</span>
                                    </div>
                                    <p className="text-sm text-warm-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-warm-200 dark:border-gray-700 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-xl">
                                    {selectedConversation.avatar}
                                </div>
                                <h3 className="font-semibold text-warm-800 dark:text-white">{selectedConversation.nickname}</h3>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${msg.from === 'me' ? 'order-2' : 'order-1'}`}>
                                            <div
                                                className={`px-4 py-2 rounded-2xl ${msg.from === 'me'
                                                    ? 'bg-primary-500 text-white rounded-br-md'
                                                    : 'bg-warm-100 dark:bg-gray-700 text-warm-800 dark:text-white rounded-bl-md'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <div className={`text-xs text-warm-400 mt-1 ${msg.from === 'me' ? 'text-right' : ''}`}>
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-warm-200 dark:border-gray-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="输入消息..."
                                        className="flex-1 px-4 py-2 rounded-full border border-warm-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                                    >
                                        发送
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-warm-400 dark:text-gray-500">
                            <div className="text-center">
                                <span className="text-6xl">💬</span>
                                <p className="mt-4">选择一个对话开始聊天</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateMessage;
