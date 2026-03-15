import { motion } from "framer-motion";
import { CheckCircle, Clock, ChefHat, Truck, Package, MapPin } from "lucide-react";

interface OrderStep {
  id: string;
  label: string;
  icon: typeof Clock;
  status: "completed" | "active" | "upcoming";
  time?: string;
}

interface OrderProgressStepperProps {
  orderStatus: string;
  createdAt?: string;
}

const OrderProgressStepper = ({ orderStatus, createdAt }: OrderProgressStepperProps) => {
  const getStepStatus = (stepIndex: number): "completed" | "active" | "upcoming" => {
    const statusOrder = ["pending", "confirmed", "preparing", "ready", "picked_up", "delivering", "delivered"];
    const currentIndex = statusOrder.indexOf(orderStatus);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  const steps: OrderStep[] = [
    { id: "confirmed", label: "تم تأكيد الطلب", icon: CheckCircle, status: getStepStatus(1) },
    { id: "preparing", label: "جاري التحضير", icon: ChefHat, status: getStepStatus(2) },
    { id: "ready", label: "جاهز للاستلام", icon: Package, status: getStepStatus(3) },
    { id: "delivering", label: "في الطريق إليك", icon: Truck, status: getStepStatus(5) },
    { id: "delivered", label: "تم التسليم", icon: MapPin, status: getStepStatus(6) },
  ];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card" dir="rtl">
      <h3 className="font-semibold text-foreground mb-4 text-sm">حالة الطلب</h3>
      <div className="space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-3">
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: step.status === "active" ? [1, 1.15, 1] : 1,
                  }}
                  transition={step.status === "active" ? { repeat: Infinity, duration: 2 } : {}}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    step.status === "completed"
                      ? "bg-success text-success-foreground"
                      : step.status === "active"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-6 ${
                      step.status === "completed" ? "bg-success" : "bg-muted"
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pt-2 pb-4">
                <p
                  className={`text-sm font-medium ${
                    step.status === "completed"
                      ? "text-success"
                      : step.status === "active"
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {step.status === "active" && (
                  <motion.p
                    className="text-xs text-primary/70 mt-0.5"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    الآن...
                  </motion.p>
                )}
                {step.status === "completed" && (
                  <p className="text-xs text-muted-foreground mt-0.5">✓ تم</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressStepper;
