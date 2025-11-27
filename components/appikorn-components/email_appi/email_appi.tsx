"use client";

import React, { useState } from "react";
import {
  Mail,
  Inbox,
  Send,
  Trash2,
  Search,
  Plus,
  Reply,
  Star,
  Edit3,
  Archive,
  ChevronDown,
  Paperclip,
  X,
  MoreHorizontal,
  Clock,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Smile,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Forward,
} from "lucide-react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EmailUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "image" | "doc" | "other";
}

export interface Email {
  id: string;
  from: EmailUser;
  to: EmailUser[];
  subject: string;
  preview: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  folder: "inbox" | "sent" | "trash" | "drafts" | "favourite";
  labels?: string[];
  attachments?: EmailAttachment[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_USERS: EmailUser[] = [
  { id: "1", name: "Jessica Koel", email: "jessica.koel@company.com", avatar: "https://i.pravatar.cc/150?u=jessica" },
  { id: "2", name: "Kamil Boerger", email: "kamil.b@company.com", avatar: "https://i.pravatar.cc/150?u=kamil" },
  { id: "3", name: "Tamara Shevchenko", email: "tamara.s@company.com", avatar: "" },
  { id: "4", name: "Sam Nelson", email: "sam.nelson@company.com", avatar: "https://i.pravatar.cc/150?u=sam" },
  { id: "me", name: "You", email: "you@company.com", avatar: "https://i.pravatar.cc/150?u=me" },
];

const LABELS = [
  { name: "Work", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Promising offers", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { name: "Work in Progress", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { name: "In acceptance", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Read later", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
];

const MOCK_EMAILS: Email[] = [
  {
    id: "1",
    from: MOCK_USERS[0],
    to: [MOCK_USERS[4]],
    subject: "Meeting with new investors",
    preview: "Hey Jontray, do you remember...",
    body: "Hey Jontray,\n\nDo you remember about tomorrow's meeting with new investors? Here you have more information about the conference at which we will be together with the client: https://conference.com/agenda/start\n\nRegards,\nJessica",
    timestamp: new Date("2024-09-16T11:26:00"),
    isRead: false,
    isStarred: false,
    folder: "inbox",
    labels: ["Promising offers"],
  },
  {
    id: "2",
    from: MOCK_USERS[1],
    to: [MOCK_USERS[4]],
    subject: "Documents delivery",
    preview: "I will send the documents as soon...",
    body: "I will send the documents as soon as possible.",
    timestamp: new Date("2024-09-16T11:15:00"),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    labels: ["Work"],
  },
  {
    id: "3",
    from: MOCK_USERS[2],
    to: [MOCK_USERS[4]],
    subject: "Business meeting",
    preview: "are you going to a business...",
    body: "Are you going to a business meeting tomorrow?",
    timestamp: new Date("2024-09-16T10:05:00"),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    labels: ["Work in Progress"],
  },
  {
    id: "4",
    from: MOCK_USERS[3],
    to: [MOCK_USERS[4]],
    subject: "Project proposal",
    preview: "I suggest to start, I have...",
    body: "I suggest to start, I have some great ideas!",
    timestamp: new Date("2024-09-16T15:09:00"),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    labels: ["In acceptance"],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getLabelColor = (labelName: string) => {
  const label = LABELS.find(l => l.name === labelName);
  return label ? label.color : "bg-gray-100 text-gray-700 border-gray-200";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EmailAppi: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<string>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(MOCK_EMAILS[0]);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const filteredEmails = emails.filter(email => {
    const folderMatch = email.folder === selectedFolder;
    const searchMatch = email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const labelMatch = activeLabel ? email.labels?.includes(activeLabel) : true;
    
    return folderMatch && searchMatch && labelMatch;
  });

  const handleStarToggle = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
    
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({ ...selectedEmail, isStarred: !selectedEmail.isStarred });
    }
  };

  const handleSendReply = () => {
    if (replyText.trim() && selectedEmail) {
      const newReply: Email = {
        id: `reply-${Date.now()}`,
        from: MOCK_USERS[4], // "You"
        to: [selectedEmail.from],
        subject: `Re: ${selectedEmail.subject}`,
        preview: replyText.substring(0, 50) + '...',
        body: replyText,
        timestamp: new Date(),
        isRead: true,
        isStarred: false,
        folder: "sent",
        labels: selectedEmail.labels,
      };
      
      setEmails([...emails, newReply]);
      setReplyText("");
    }
  };

  const handleSendNewEmail = (formData: any) => {
    const newEmail: Email = {
      id: `new-${Date.now()}`,
      from: MOCK_USERS[4], // "You"
      to: [{ id: "recipient", name: formData.to, email: formData.to }],
      subject: formData.subject,
      preview: formData.message.substring(0, 50) + '...',
      body: formData.message,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      folder: "sent",
      labels: [formData.type],
    };
    
    setEmails([...emails, newEmail]);
    setIsComposing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans">

      {/* ====================================================================== */}
      {/* LEFT SIDEBAR */}
      {/* ====================================================================== */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        
        {/* Header */}
        <div className="p-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
          <Mail size={20} className="text-gray-700 dark:text-gray-300" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mailbox</h1>
        </div>

        {/* New Message Button */}
        <div className="p-4">
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium"
            size="lg"
            radius="lg"
            startContent={<Mail size={18} />}
            onClick={() => setIsComposing(true)}
          >
            New message
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 overflow-y-auto">
          <nav className="space-y-1">
            <NavItem 
              icon={<Inbox size={18} />} 
              label="Inbox" 
              count={emails.filter(e => e.folder === "inbox" && !e.isRead).length}
              isActive={selectedFolder === "inbox"} 
              onClick={() => setSelectedFolder("inbox")}
            />
            <NavItem 
              icon={<Send size={18} />} 
              label="Sent Emails" 
              count={emails.filter(e => e.folder === "sent").length}
              isActive={selectedFolder === "sent"} 
              onClick={() => setSelectedFolder("sent")}
            />
            <NavItem 
              icon={<Star size={18} />} 
              label="Favourite" 
              count={emails.filter(e => e.isStarred).length}
              isActive={selectedFolder === "favourite"} 
              onClick={() => setSelectedFolder("favourite")}
            />
            <NavItem 
              icon={<Edit3 size={18} />} 
              label="Draft" 
              count={emails.filter(e => e.folder === "drafts").length}
              isActive={selectedFolder === "drafts"} 
              onClick={() => setSelectedFolder("drafts")}
            />
            <NavItem 
              icon={<Trash2 size={18} />} 
              label="Deleted" 
              count={emails.filter(e => e.folder === "trash").length}
              isActive={selectedFolder === "trash"} 
              onClick={() => setSelectedFolder("trash")}
            />
          </nav>

          {/* Labels */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Labels</span>
              <Plus size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="space-y-1">
              {LABELS.map(label => (
                <LabelItem 
                  key={label.name} 
                  name={label.name} 
                  color={label.color}
                  isActive={activeLabel === label.name}
                  onClick={() => setActiveLabel(activeLabel === label.name ? null : label.name)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* EMAIL LIST */}
      {/* ====================================================================== */}
      <div className="w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        
        {/* Search and Filter Tag */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Active Filter Tag */}
        {activeLabel && (
          <div className="px-4 pb-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getLabelColor(activeLabel)}`}>
              {activeLabel}
              <X 
                size={12} 
                className="cursor-pointer" 
                onClick={() => setActiveLabel(null)}
              />
            </div>
          </div>
        )}

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map(email => (
            <EmailListItem 
              key={email.id} 
              email={email} 
              isSelected={selectedEmail?.id === email.id}
              onClick={() => setSelectedEmail(email)}
              onStarToggle={() => handleStarToggle(email.id)}
            />
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* EMAIL DETAIL */}
      {/* ====================================================================== */}
      <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between mb-4">
                {/* Labels */}
                <div className="flex flex-wrap gap-2">
                  {selectedEmail.labels?.map(label => (
                    <span 
                      key={label} 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLabelColor(label)}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button isIconOnly variant="light" size="sm">
                    <Reply size={18} className="text-gray-400" />
                  </Button>
                  <Button isIconOnly variant="light" size="sm">
                    <Forward size={18} className="text-gray-400" />
                  </Button>
                  <Button 
                    isIconOnly 
                    variant="light" 
                    size="sm"
                    onClick={() => handleStarToggle(selectedEmail.id)}
                  >
                    <Star 
                      size={18} 
                      className={selectedEmail.isStarred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
                    />
                  </Button>
                  <Button isIconOnly variant="light" size="sm">
                    <Archive size={18} className="text-gray-400" />
                  </Button>
                  <Button isIconOnly variant="light" size="sm">
                    <Trash2 size={18} className="text-gray-400" />
                  </Button>
                  <Button isIconOnly variant="light" size="sm">
                    <MoreHorizontal size={18} className="text-gray-400" />
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Today, {selectedEmail.timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}, {formatTime(selectedEmail.timestamp)}
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {selectedEmail.subject}
                </h1>
              </div>
            </div>

            {/* Email Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Original Message */}
              <EmailThread 
                sender={selectedEmail.from}
                timestamp={selectedEmail.timestamp}
                body={selectedEmail.body}
                labels={selectedEmail.labels}
              />

              {/* Reply Input */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mt-6">
                <textarea
                  placeholder="Write your message..."
                  className="w-full bg-transparent border-none resize-none focus:ring-0 text-gray-700 dark:text-gray-300 mb-4"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                
                {/* Formatting Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button isIconOnly variant="light" size="sm">
                      <Bold size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <Italic size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <Underline size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <LinkIcon size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                    <Button isIconOnly variant="light" size="sm">
                      <List size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <AlignLeft size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <AlignCenter size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <AlignRight size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button isIconOnly variant="light" size="sm">
                      <Paperclip size={18} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <ImageIcon size={18} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <Smile size={18} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <Archive size={18} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button isIconOnly variant="light" size="sm">
                      <MoreHorizontal size={18} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                    <Button 
                      className="bg-teal-500 hover:bg-teal-600 text-white px-6"
                      size="md"
                      radius="lg"
                      endContent={<Send size={16} />}
                      onClick={handleSendReply}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Mail size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select an email to read</p>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* COMPOSE MODAL */}
      {/* ====================================================================== */}
      {isComposing && (
        <ComposeModal 
          onClose={() => setIsComposing(false)}
          onSend={handleSendNewEmail}
          labels={LABELS}
        />
      )}
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const NavItem = ({ icon, label, count, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
      ${isActive 
        ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400" 
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}
    `}
  >
    <span className={isActive ? "text-teal-600" : "text-gray-400"}>{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {count !== undefined && count > 0 && (
      <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full font-semibold">
        {count}
      </span>
    )}
  </button>
);

const LabelItem = ({ name, color, isActive, onClick }: { name: string, color: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left
      ${isActive 
        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}
    `}
  >
    <div className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`}></div>
    <span className="flex-1">{name}</span>
    <MoreHorizontal size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
  </button>
);

const EmailListItem = ({ email, isSelected, onClick, onStarToggle }: { email: Email, isSelected: boolean, onClick: () => void, onStarToggle: () => void }) => (
  <div 
    onClick={onClick}
    className={`
      p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors
      ${isSelected ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"}
    `}
  >
    <div className="flex gap-3">
      {email.from.avatar ? (
        <Avatar src={email.from.avatar} className="w-10 h-10 flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-medium flex-shrink-0">
          {email.from.name.substring(0, 2).toUpperCase()}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${!email.isRead ? "text-gray-900 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
            {email.from.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {formatTime(email.timestamp)}
            </span>
            <Star 
              size={14} 
              className={`cursor-pointer ${
                email.isStarred 
                  ? "text-yellow-500 fill-yellow-500" 
                  : "text-gray-300 hover:text-yellow-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onStarToggle();
              }}
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
          {email.subject}
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
          {email.preview}
        </div>

        {/* Email Labels */}
        {email.labels && email.labels.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {email.labels.map(label => (
              <span 
                key={label} 
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getLabelColor(label)}`}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Unread Indicator */}
        {!email.isRead && (
          <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
        )}
      </div>
    </div>
  </div>
);

const EmailThread = ({ sender, timestamp, body, labels, isYou }: { sender: EmailUser, timestamp: Date, body: string, labels?: string[], isYou?: boolean }) => (
  <div className="flex gap-4">
    {sender.avatar ? (
      <Avatar src={sender.avatar} className="w-10 h-10 flex-shrink-0" />
    ) : (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium flex-shrink-0 ${
        isYou ? "bg-teal-100 text-teal-600" : "bg-gray-200 text-gray-600"
      }`}>
        {sender.name.substring(0, 2).toUpperCase()}
      </div>
    )}
    
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <span className={`font-semibold ${isYou ? "text-teal-600" : "text-gray-900 dark:text-white"}`}>
          {sender.name}
        </span>
        
        {/* Labels for the email thread */}
        {labels && labels.length > 0 && (
          <div className="flex gap-1">
            {labels.map(label => (
              <span 
                key={label} 
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getLabelColor(label)}`}
              >
                {label}
              </span>
            ))}
          </div>
        )}
        
        <span className="text-sm text-gray-400 ml-auto">
          {formatDate(timestamp)} {formatTime(timestamp)}
        </span>
      </div>
      
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {body}
      </div>
    </div>
  </div>
);

const ComposeModal = ({ onClose, onSend, labels }: { onClose: () => void, onSend: (data: any) => void, labels: any[] }) => {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    type: "Work",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.to && formData.subject && formData.message) {
      onSend(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New message</h3>
          <Button 
            isIconOnly 
            variant="light" 
            size="sm"
            onClick={onClose}
          >
            <X size={20} className="text-gray-400" />
          </Button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* To Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">To</label>
            <input 
              type="email" 
              placeholder="Enter recipient email"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
              required
            />
          </div>

          {/* Subject Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Subject</label>
            <input 
              type="text" 
              placeholder="Enter subject"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
          </div>

          {/* Email Type Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Type</label>
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              {labels.map(label => (
                <option key={label.name} value={label.name}>{label.name}</option>
              ))}
            </select>
          </div>

          {/* Message Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Message</label>
            <textarea 
              placeholder="Write your message..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
              rows={8}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button isIconOnly variant="light" size="sm" type="button">
              <Bold size={16} className="text-gray-400 hover:text-gray-600" />
            </Button>
            <Button isIconOnly variant="light" size="sm" type="button">
              <Italic size={16} className="text-gray-400 hover:text-gray-600" />
            </Button>
            <Button isIconOnly variant="light" size="sm" type="button">
              <Underline size={16} className="text-gray-400 hover:text-gray-600" />
            </Button>
            <Button isIconOnly variant="light" size="sm" type="button">
              <LinkIcon size={16} className="text-gray-400 hover:text-gray-600" />
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <Button isIconOnly variant="light" size="sm" type="button">
              <Paperclip size={16} className="text-gray-400 hover:text-gray-600" />
            </Button>
            <Button isIconOnly variant="light" size="sm" type="button">
              <ImageIcon size={16} className="text-gray-400 hover:text-gray-600" />
            </Button>
            <Button isIconOnly variant="light" size="sm" type="button">
              <Smile size={16} className="text-gray-400 hover:text-gray-600" />
            </Button>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <Button 
            variant="bordered" 
            className="border-gray-300 dark:border-gray-600"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-teal-500 hover:bg-teal-600 text-white"
            endContent={<Send size={16} />}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailAppi;