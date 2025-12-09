import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Global_API_BASE from "../services/GlobalConstants";

interface Review {
  profile_photo_url?: string;
  author_name: string;
  relative_time_description: string;
  rating: number;
  text: string;
}

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${Global_API_BASE}/api/reviews`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();

        const googleReviews = data.result?.reviews || [];
        setReviews(googleReviews);
        setTotalReviews(googleReviews.length);
      } catch (error) {
        console.error("Error fetching Google Reviews:", error);
        // Fallback or mock data could go here
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-10xl mx-auto px-4">

        {/* ⭐ ROW 1 — CUSTOMER REVIEWS (HORIZONTAL SCROLL, FULL WIDTH) */}
        <div className="bg-white rounded-2xl shadow-lg border border-peach-200 p-2 mb-2">
          <h3 className="text-2xl font-bold text-navy-900 mb-4">
            What People Are Saying
          </h3>

          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-6 pb-4">

              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="min-w-[280px] max-w-[280px] bg-white rounded-2xl shadow-md
                             border border-peach-200 p-6 hover:shadow-xl transition flex-shrink-0"
                >
                  {/* Reviewer */}
                  <div className="flex items-center mb-3">
                    <img
                      src={review.profile_photo_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(review.author_name) + "&background=random"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "/lady-avatar.png") {
                          target.src = "/lady-avatar.png";
                        }
                      }}
                      className="w-10 h-10 rounded-full border mr-3"
                      alt={review.author_name}
                    />

                    <div>
                      <h4 className="font-semibold text-navy-900 text-sm">
                        {review.author_name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {review.relative_time_description}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                    {review.text}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* ⭐ ROW 2 — KUSHI SERVICES SUMMARY (ALL IN ONE ROW) */}
        <div className="bg-white rounded-2xl shadow-lg border border-peach-200 p-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* LEFT — Title */}
            <h2 className="text-xl font-bold text-navy-900 whitespace-nowrap">
              Kushi Cleaning Services
            </h2>

            {/* CENTER — Rating */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-navy-900">{rating}</span>

              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={22}
                    className={
                      i < Math.round(rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            </div>

            {/* BASED ON REVIEWS */}
            <p className="text-gray-600 text-sm whitespace-nowrap">
              Based on Google reviews
            </p>

            {/* BUTTON */}
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJ3S9FM6MTrjsRnW-EP3Rwa8Q"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                         px-6 py-2.5 rounded-lg shadow-md transition text-sm whitespace-nowrap"
            >
              ✍️ Write a Review
            </a>

          </div>
        </div>

      </div>
    </section>
  );
}