import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OfferNotificationListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const channel = supabase
      .channel("new-offers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "offers" },
        (payload) => {
          const offer = payload.new as any;
          if (!offer.is_active) return;

          toast(offer.title, {
            description: offer.subtitle || `خصم ${offer.discount}`,
            icon: <Gift className="h-5 w-5 text-primary" />,
            duration: 8000,
            position: "top-center",
            action: {
              label: "شاهد العروض",
              onClick: () => navigate("/"),
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  return null;
};

export default OfferNotificationListener;
