# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# ------------------------------------
# MAIN SERVICE CATEGORIES
# ------------------------------------
CATEGORIES = {
    "residential cleaning": "Residential Cleaning Services",
    "commercial cleaning": "Commercial Cleaning Services",
    "industrial cleaning": "Industrial Cleaning Services",
    "polishing services": "Polishing Services",
    "packers and movers": "Packers and Movers",
    "pest control": "Pest Control Services",
    "full home deep cleaning": "Full Home Deep Cleaning Services",
    "kitchen cleaning": "Kitchen Cleaning Services",
    "bathroom cleaning": "Bathroom Cleaning Services",
    "sofa cleaning": "Sofa Cleaning Services",
    "carpet cleaning": "Carpet Cleaning Services",
    "mattress cleaning": "Mattress Cleaning Services",
    "window cleaning": "Window Cleaning Services",
    "balcony cleaning": "Balcony Cleaning Services",
    "hall cleaning": "Hall Cleaning Services",
    "bedroom cleaning": "Bedroom Cleaning Services",
    "water sump cleaning": "Water Sump Cleaning Services",
    "water tank cleaning": "Water Tank Cleaning Services",
    "floor cleaning": "Floor Deep Cleaning / Floor Basic Cleaning",
    "marble polishing": "Polishing Services"
}

# ------------------------------------
# SUB-CATEGORIES (from your document)
# ------------------------------------
SUBCATEGORIES = {
    "residential cleaning": [
        "full home deep cleaning", "kitchen cleaning", "bathroom cleaning",
        "sofa cleaning", "carpet cleaning", "mattress cleaning",
        "window cleaning", "balcony cleaning", "hall cleaning",
        "bedroom cleaning", "exterior cleaning", "water sump cleaning",
        "water tank cleaning", "floor cleaning"
    ],

    "kitchen cleaning": [
        "occupied kitchen cleaning", "empty kitchen cleaning",
        "kitchen chimney cleaning", "micro oven cleaning",
        "exhaust fan cleaning", "fridge cleaning"
    ],

    "bathroom cleaning": [
        "bathroom basic cleaning", "bathroom deep cleaning",
        "luxury bathroom deep cleaning"
    ],

    "sofa cleaning": [
        "fabric sofa cleaning", "leather sofa cleaning",
        "recliner sofa cleaning", "sectional sofa cleaning"
    ],

    "carpet cleaning": [
        "carpet small size", "carpet medium size",
        "carpet large size", "carpet deep shampooing"
    ],

    "mattress cleaning": [
        "single mattress cleaning", "queen mattress cleaning",
        "king mattress cleaning"
    ],

    "window cleaning": [
        "small window cleaning", "medium window cleaning",
        "large window cleaning", "extra large window cleaning"
    ],

    "balcony cleaning": [
        "balcony basic cleaning", "balcony deep cleaning"
    ],

    "hall cleaning": [
        "hall basic cleaning", "hall deep cleaning"
    ],

    "bedroom cleaning": [
        "bedroom basic cleaning", "bedroom deep cleaning"
    ],

    "pest control": [
        "cockroach pest control", "bedbug pest control",
        "termite treatment", "woodborer pest control",
        "rodent pest control", "mosquito pest control",
        "general pest control", "commercial pest control",
        "AMC pest control"
    ],

    "polishing services": [
        "indian marble polishing", "italian marble polishing",
        "mosaic tile polishing", "granite polishing"
    ],

    "packers and movers": [
        "home shifting services", "office shifting services",
        "local shifting", "packing and loading"
    ]
}

# ------------------------------------
# COMPANY INFORMATION
# ------------------------------------
COMPANY_INFO = {
    "contact": "📞 You can reach Kushi Cleaning Services at +91 9876543210 (WhatsApp / Call).",
    "timings": "⏰ We operate 7 days a week from 8 AM – 9 PM.",
    "about": (
        "🏠 Kushi Cleaning Services provides professional Residential, Commercial, "
        "Industrial Cleaning, Polishing, Pest Control, and Packers & Movers services."
    )
}

# ------------------------------------
# BOOKING INFORMATION
# ------------------------------------
BOOKING_INSTRUCTIONS = (
    "📝 To book a service:\n"
    "1️⃣ Tell me what service you need.\n"
    "2️⃣ Share your preferred date, time & location.\n"
    "3️⃣ Our team will confirm via WhatsApp/Call.\n\n"
    "📞 You can also contact us directly at +91 9876543210."
)

# ------------------------------------
# GREETINGS
# ------------------------------------
GREETINGS = [
    "hi", "hello", "hey", "good morning",
    "good afternoon", "good evening", "namaste"
]

# ------------------------------------
# MAIN CHAT LOGIC
# ------------------------------------
def get_answer(user_message: str) -> str:
    if not user_message:
        return "Please type your message again."

    msg = user_message.lower().strip()

    # Greetings
    for g in GREETINGS:
        if g in msg:
            return (
                "Hello 😊! Welcome to Kushi Cleaning Services.\n"
                "How can I help you? You can ask:\n"
                "• What services do you provide?\n"
                "• Subcategories of kitchen cleaning\n"
                "• How to book a service?\n"
                "• Do you bring chemicals?\n"
            )

    # Contact
    if "contact" in msg or "phone" in msg or "call" in msg or "whatsapp" in msg:
        return COMPANY_INFO["contact"]

    # Timings
    if "time" in msg or "timings" in msg or "hours" in msg:
        return COMPANY_INFO["timings"]

    # About us
    if "about" in msg or "kushi" in msg:
        return COMPANY_INFO["about"]

    # Booking
    if "book" in msg or "booking" in msg or "how to book" in msg:
        return BOOKING_INSTRUCTIONS

    # Equipment / Chemicals
    if any(word in msg for word in [
        "equipment", "tools", "materials",
        "chemicals", "do you bring",
        "cleaning products", "machines", "vacuum",
        "do i need to provide", "do we need to provide"
    ]):
        return (
            "🧼 Our Kushi team brings all required equipment, tools, machines and "
            "professional cleaning chemicals.\n"
            "You don't need to provide anything.\n\n"
            "If you have any doubts, feel free to contact our team on WhatsApp or Call at +91 9876543210. 😊"
        )

    # What services do you provide
    if "what services" in msg or "services you provide" in msg or "service list" in msg:
        all_services = "\n- ".join(CATEGORIES.values())
        return f"Here are our main services:\n- {all_services}\n\nAsk for 'subcategories of kitchen cleaning' for more details."

    # Full list
    if "all services" in msg or "list all" in msg:
        all_services = "\n- ".join(sorted(CATEGORIES.values()))
        return f"Here is the full list of services:\n- {all_services}"

    # Subcategories
    if "subcategories of" in msg:
        for category in SUBCATEGORIES:
            if category in msg:
                items = "\n- ".join(SUBCATEGORIES[category])
                return f"Here are the subcategories under {category.title()}:\n- {items}"
        return "I couldn't find that service category. Please ask like 'subcategories of kitchen cleaning'."

    # If user types only a category name
    for cat in CATEGORIES:
        if cat in msg:
            sub = SUBCATEGORIES.get(cat, None)
            if sub:
                items = "\n- ".join(sub)
                return (
                    f"You asked about {CATEGORIES[cat]}.\n"
                    f"Here are the sub services:\n- {items}\n\n"
                    "If you want to book, just tell me the date & time. 😊"
                )
            return f"You asked about {CATEGORIES[cat]}. How can I help you with this service?"

    # If user types a sub-service
    for cat, sublist in SUBCATEGORIES.items():
        for sub in sublist:
            if sub in msg:
                return (
                    f"You asked about {sub}.\n"
                    f"This service is part of {cat.title()}.\n"
                    "If you'd like to book it, tell me your date, time & location. 😊"
                )

    # Default fallback
    return (
        "I'm not sure I understood that. Please try again.\n"
        "You can ask things like:\n"
        "• What services do you provide?\n"
        "• Subcategories of kitchen cleaning\n"
        "• Do you bring chemicals?\n"
        "• How to book a service?\n"
    )

# ------------------------------------
# FLASK ROUTE
# ------------------------------------
@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json(force=True, silent=True) or {}
    reply = get_answer(data.get("message", ""))
    return jsonify({"reply": reply})

if __name__ == '__main__':
    print("🚀 Kushi Chatbot Running on port 5000...")
    app.run(host="0.0.0.0", port=5000, threaded=True, debug=True)
