import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Send, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderChatProps {
  orderId: string;
  isDriver?: boolean;
  onClose?: () => void;
}

interface ChatMsg {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  created_at: string;
}

const OrderChat = ({ orderId, isDriver = false, onClose }: OrderChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as ChatMsg[]);
    };
    load();

    // Realtime subscription
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMsg;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user || sending) return;
    setSending(true);
    const msg = text.trim();
    setText("");

    await supabase.from("chat_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      sender_role: isDriver ? "driver" : "customer",
      message: msg,
    } as any);

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      className="bg-card rounded-2xl shadow-card overflow-hidden flex flex-col"
      style={{ height: 380 }}
    >
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary-foreground" />
          <span className="text-sm font-bold text-primary-foreground">
            {isDriver ? "محادثة مع العميل" : "محادثة مع السائق"}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="bg-primary-foreground/20 rounded-full p-1">
            <X className="h-4 w-4 text-primary-foreground" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">ابدأ المحادثة...</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex ${isMine ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2 shrink-0" dir="rtl">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          maxLength={500}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default OrderChat;
