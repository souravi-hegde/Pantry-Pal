import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I add items to my pantry?",
    a: "Click the 'Add Item' button on the Inventory page. Enter the item name, quantity, unit, expiry date, and select a category. Your items will be automatically sorted by expiry date.",
  },
  {
    q: "How does expiry tracking work?",
    a: "PantryPal automatically calculates days until expiry for each item. Items are labeled as 'Fresh', 'Near Expiry' (within your lead time), or 'Expired' based on the current date.",
  },
  {
    q: "What is the Waste Tracking page?",
    a: "The Waste Tracking page shows a history of all items you've marked as 'Used' or 'Wasted'. Use the 'Mark Used' or 'Mark Wasted' buttons in your Inventory to log items there.",
  },
  {
    q: "How do I find recipes?",
    a: "Go to the Recipes page and select ingredients from your pantry or add them manually. Click 'Find Recipes' to get suggestions from our Spoonacular database that use your ingredients.",
  },
  {
    q: "What does the Analytics page show?",
    a: "The Analytics page displays your waste vs. usage statistics and shows your top 5 most wasted items. Use this to identify patterns and reduce food waste.",
  },
  {
    q: "Can I customize when I get notifications?",
    a: "Yes! Go to Settings and adjust your 'Notification Lead Time'. This controls how many days before expiry you'll be notified about items.",
  },
  {
    q: "What's the difference between 'Used' and 'Wasted'?",
    a: "'Used' means you consumed the item before it expired. 'Wasted' means the item expired or spoiled before you could use it. Both are tracked for analytics.",
  },
  {
    q: "How do I log items as used or wasted?",
    a: "In your Inventory, find the item and click the green checkmark (✓) to mark it as 'Used' or the red X to mark it as 'Wasted'. The item will be removed from inventory and added to your waste log.",
  },
];

export default function Profile() {
  const navigate = useNavigate();

  // Auth guard - redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Help & Support</h1>
          <p className="text-muted-foreground">Find answers to common questions about PantryPal</p>
        </div>

        <Card className="p-8 rounded-3xl shadow-card">
          <div className="flex items-center gap-4 mb-8">
            <HelpCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-6 bg-muted/20">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </AppLayout>
  );
}
