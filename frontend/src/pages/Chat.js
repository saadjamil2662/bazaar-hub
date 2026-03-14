import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInboxConversations, getMessageThread, sendMessage } from '../services/api';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const preferredUserId = searchParams.get('userId');
  const preferredUserName = searchParams.get('name') || 'User';
  const preferredProductId = searchParams.get('productId');

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadInbox = async () => {
    try {
      const res = await getInboxConversations({ limit: 100 });
      const list = res.data.conversations || [];
      setConversations(list);
      return list;
    } catch (err) {
      console.error('Failed to load inbox:', err);
      setError(err.response?.data?.error || 'Failed to load inbox');
      return [];
    }
  };

  const loadThread = async (otherUserId) => {
    if (!otherUserId) {
      setMessages([]);
      return;
    }

    setLoadingThread(true);
    try {
      const res = await getMessageThread(otherUserId, { limit: 100 });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(err.response?.data?.error || 'Failed to load messages');
    }
    setLoadingThread(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeInbox = async () => {
      setLoadingInbox(true);
      const list = await loadInbox();

      if (!mounted) return;

      const preferred = preferredUserId
        ? list.find((item) => String(item.other_user_id) === String(preferredUserId))
        : null;

      if (preferred) {
        setSelectedUser({
          id: preferred.other_user_id,
          name: preferred.other_user_name || preferredUserName
        });
      } else if (preferredUserId) {
        setSelectedUser({ id: preferredUserId, name: preferredUserName });
      } else if (list.length > 0) {
        setSelectedUser({
          id: list[0].other_user_id,
          name: list[0].other_user_name || 'User'
        });
      } else {
        setSelectedUser(null);
      }

      setLoadingInbox(false);
    };

    initializeInbox();

    return () => {
      mounted = false;
    };
  }, [preferredUserId, preferredUserName]);

  useEffect(() => {
    if (!selectedUser?.id) {
      setMessages([]);
      return;
    }

    loadThread(selectedUser.id);

    const interval = setInterval(async () => {
      await loadInbox();
      await loadThread(selectedUser.id);
    }, 6000);

    return () => clearInterval(interval);
  }, [selectedUser?.id]);

  const handleConversationSelect = async (conversation) => {
    setError('');
    setSelectedUser({
      id: conversation.other_user_id,
      name: conversation.other_user_name || 'User'
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser?.id || !content.trim()) return;

    setSending(true);
    setError('');

    try {
      await sendMessage({
        receiverId: selectedUser.id,
        content: content.trim(),
        productId: preferredProductId || undefined
      });

      setContent('');
      await loadInbox();
      await loadThread(selectedUser.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    }

    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Inbox</h1>

        {error && (
          <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 h-[70vh] overflow-hidden">
          <div className="md:col-span-1 border-r overflow-y-auto">
            <div className="p-3 border-b font-semibold">Conversations</div>

            {loadingInbox ? (
              <div className="p-4 text-gray-600 text-sm">Loading inbox...</div>
            ) : conversations.length === 0 && !selectedUser ? (
              <div className="p-4 text-gray-600 text-sm">No messages yet.</div>
            ) : (
              <div>
                {selectedUser &&
                  !conversations.some(
                    (c) => String(c.other_user_id) === String(selectedUser.id)
                  ) && (
                    <button
                      type="button"
                      onClick={() => setSelectedUser(selectedUser)}
                      className="w-full text-left px-4 py-3 border-b bg-blue-50"
                    >
                      <div className="font-medium truncate">{selectedUser.name}</div>
                      <div className="text-xs text-gray-500">Start conversation</div>
                    </button>
                  )}

                {conversations.map((conversation) => {
                  const active =
                    selectedUser &&
                    String(selectedUser.id) === String(conversation.other_user_id);

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleConversationSelect(conversation)}
                      className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                        active ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium truncate">
                        {conversation.other_user_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {conversation.content}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(conversation.created_at).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-3 border-b font-semibold">Chat with {selectedUser.name}</div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingThread ? (
                    <div className="text-gray-600 text-sm">Loading conversation...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-gray-600 text-sm">
                      No messages yet. Send the first message.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = user && msg.sender_id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                            <div className="mt-1 text-[10px] opacity-75 text-right">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                Select a conversation from your inbox.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
