import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stores } from "@/lib/data";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiFoodChatProps {
  open: boolean;
  onClose: () => void;
}

const suggestions = [
  "أريد أكل صحي بأقل من 50 جنيه",
  "اقترح لي وجبة غداء سريعة",
  "أريد حلويات شرقية",
  "ما أفضل مطعم شاورما؟",
];

const AiFoodChat = ({ open, onClose }: AiFoodChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! 👋 أنا مساعدك الذكي للطعام. أخبرني ماذا تشتهي وسأساعدك في إيجاد أفضل الوجبات والمطاعم! 🍽️" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAiResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Smart matching based on available stores
    const matchedStores = stores.filter((s) => {
      const storeLower = s.name.toLowerCase();
      const categoryLower = s.category.toLowerCase();
      const productsText = s.products.map((p) => p.name.toLowerCase()).join(" ");
      return storeLower.includes(msg) || categoryLower.includes(msg) || msg.includes(categoryLower) || productsText.includes(msg);
    });

    if (msg.includes("صحي") || msg.includes("healthy")) {
      const healthyStores = stores.filter((s) => ["خضار", "فواكه"].includes(s.category));
      if (healthyStores.length > 0) {
        return `🥗 إليك خيارات صحية:\n\n${healthyStores.map((s) => `• **${s.name}** - ${s.category}\n  توصيل خلال ${s.deliveryTime} دقيقة | رسوم التوصيل ${s.deliveryFee} ج.م`).join("\n\n")}\n\nهل تريد تفاصيل أكثر عن أي منها؟`;
      }
    }

    if (msg.includes("شاورما") || msg.includes("shawarma")) {
      const shawarmaStores = stores.filter((s) => s.products.some((p) => p.name.includes("شاورما")) || s.name.includes("شاورما"));
      if (shawarmaStores.length > 0) {
        return `🌯 أفضل محلات الشاورما:\n\n${shawarmaStores.map((s) => `• **${s.name}** ⭐ ${s.rating}\n  ${s.products.filter((p) => p.name.includes("شاورما")).map((p) => `${p.name}: ${p.price} ج.م`).join(" | ")}`).join("\n\n")}`;
      }
    }

    if (msg.includes("حلويات") || msg.includes("sweets")) {
      const sweetStores = stores.filter((s) => s.category === "حلويات");
      return sweetStores.length > 0
        ? `🍰 محلات الحلويات المتاحة:\n\n${sweetStores.map((s) => `• **${s.name}** ⭐ ${s.rating} | توصيل ${s.deliveryFee} ج.م`).join("\n")}`
        : "عذراً، لا تتوفر محلات حلويات حالياً 😞";
    }

    if (msg.includes("غداء") || msg.includes("سريع") || msg.includes("lunch")) {
      const fastStores = stores.filter((s) => s.category === "مطاعم").slice(0, 3);
      return `🍔 وجبات غداء سريعة:\n\n${fastStores.map((s) => `• **${s.name}** - توصيل ${s.deliveryTime} دقيقة\n  ${s.products.slice(0, 2).map((p) => `${p.name} (${p.price} ج.م)`).join(" | ")}`).join("\n\n")}\n\nهل تريد الطلب من أي مطعم؟ 😊`;
    }

    if (msg.includes("بيتزا") || msg.includes("pizza")) {
      const pizzaStores = stores.filter((s) => s.products.some((p) => p.name.includes("بيتزا")) || s.name.includes("بيتزا"));
      if (pizzaStores.length > 0) {
        return `🍕 محلات البيتزا:\n\n${pizzaStores.map((s) => `• **${s.name}** ⭐ ${s.rating}\n  ${s.products.filter((p) => p.name.includes("بيتزا")).map((p) => `${p.name}: ${p.price} ج.م`).join(" | ")}`).join("\n\n")}`;
      }
    }

    if (matchedStores.length > 0) {
      return `وجدت لك ${matchedStores.length} نتائج:\n\n${matchedStores.slice(0, 4).map((s) => `• **${s.name}** ⭐ ${s.rating} - ${s.category}\n  توصيل خلال ${s.deliveryTime} دقيقة`).join("\n\n")}`;
    }

    // Default fallback
    const randomStores = stores.sort(() => Math.random() - 0.5).slice(0, 3);
    return `🤔 لم أجد نتائج مطابقة بالضبط، لكن إليك بعض الاقتراحات:\n\n${randomStores.map((s) => `• **${s.name}** - ${s.category} ⭐ ${s.rating}`).join("\n")}\n\nجرب أن تسألني عن نوع معين من الطعام! 🍽️`;
  };

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAiResponse(message);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-4 rounded-b-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-card/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-primary-foreground">مساعد الطعام الذكي</h2>
            <p className="text-xs text-primary-foreground/70">مدعوم بالذكاء الاصطناعي</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-card/20 rounded-full p-2">
          <X className="h-5 w-5 text-primary-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}>
              {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card text-foreground shadow-card rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-card rounded-2xl px-4 py-3 shadow-card">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="whitespace-nowrap bg-accent text-accent-foreground px-3 py-2 rounded-full text-xs font-medium shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="اكتب ما تشتهي..."
            className="flex-1 h-12 rounded-xl bg-muted/50 border-0"
            maxLength={500}
          />
          <Button onClick={() => handleSend()} className="h-12 w-12 rounded-xl p-0" disabled={!input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiFoodChat;
