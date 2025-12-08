import React from 'react';
import './PreviousChatsSidebar.css'; // Optional: Add styles if needed

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: string;
}

interface PreviousChatsSidebarProps {
  chats: ChatHistoryItem[];
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

const PreviousChatsSidebar: React.FC<PreviousChatsSidebarProps> = ({ chats, onSelectChat, selectedChatId }) => {
  return (
    <aside className="previous-chats-sidebar" style={{ width: 260, borderRight: '1px solid #eee', background: '#fafafa', padding: '1rem', height: '100vh' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Chat History</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {chats.length === 0 ? (
          <li style={{ color: '#888' }}>No previous chats.</li>
        ) : (
          chats.map(chat => (
            <li
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              style={{
                cursor: 'pointer',
                background: selectedChatId === chat.id ? '#e0e7ff' : 'transparent',
                borderRadius: 6,
                marginBottom: 6,
                padding: '8px 12px',
                transition: 'background 0.2s',
                boxShadow: selectedChatId === chat.id ? '0 0 2px #4f46e5' : 'none',
              }}
            >
              <div style={{ fontWeight: 500 }}>{chat.title}</div>
              {chat.lastMessage && (
                <div style={{ fontSize: '.95em', color: '#555', marginTop: 2 }}>{chat.lastMessage}</div>
              )}
              {chat.timestamp && (
                <div style={{ fontSize: '.8em', color: '#aaa', marginTop: 2 }}>{chat.timestamp}</div>
              )}
            </li>
          ))
        )}
      </ul>
    </aside>
  );
};

export default PreviousChatsSidebar;
