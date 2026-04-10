import { Star, ThumbsUp, CheckCircle, Shield } from "lucide-react";
import { useState } from "react";

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  likes: number;
  adminResponse: {
    message: string;
    date: string;
  };
}

const reviews: Review[] = [
  {
    id: "1",
    author: "Clair Wayne",
    date: "03/13/2026",
    rating: 5,
    title: "Trusted platform with immediate withdrawal",
    content:
      "I decided to invest with Iamverse and tried Bitcoin Elite Group in order to earn profit. My investment in the Business plan expired yesterday, and this morning I requested a withdrawal of 50,000 Usdt. The withdrawal was processed immediately and sent straight to my Kraken account without even needing to contact support. This has really increased my confidence in continuing to work with them.\n\nBravo à l'équipe 👏",
    verified: true,
    likes: 24,
    adminResponse: {
      message:
        "Thank you so much for your kind words, Clair! We're thrilled to hear that your withdrawal was processed seamlessly. Our team works around the clock to ensure every transaction is handled swiftly and securely. We truly appreciate your trust in IAMVERSE and we promise to keep delivering the best experience possible. Looking forward to many more successful investments together! 🚀",
      date: "03/13/2026",
    },
  },
  {
    id: "2",
    author: "Aleksander",
    date: "01/03/2026",
    rating: 5,
    title: "I love the level of transparency on their website…",
    content:
      "I love the level of transparency on their website operations, both deposit and withdrawal lists. No hidden charges, or withdrawal fees here. All operations/transactions goes exactly as they stated.",
    verified: true,
    likes: 18,
    adminResponse: {
      message:
        "We really appreciate your feedback, Aleksander! Transparency is at the core of everything we do at IAMVERSE. We believe our investors deserve complete clarity on every transaction. We'll continue to uphold these standards and strive to make your experience even better. Thank you for being part of our community! 💪",
      date: "01/04/2026",
    },
  },
  {
    id: "3",
    author: "Dominic Curtis",
    date: "02/03/2026",
    rating: 5,
    title: "They cleared my doubts",
    content:
      "I was introduced to this platform by my colleague whom didn't just claim to have been benefiting from them but actually show me his investment growth with them which was what convinced me. I started with the first plan which has a minimum amount to start and behold they delivered as promised. I tried again by reinvesting in 8888 Investment till I get to Tier 3 Investment plan and I just got another payout 2 days ago. It's been 6 months of smooth and swift investment circle with Iamverse, I chose to write about my experience with them as they cleared my doubts.",
    verified: true,
    likes: 31,
    adminResponse: {
      message:
        "Thank you for sharing your journey with us, Dominic! It means the world to hear that we could earn your trust through consistent results. Stories like yours inspire us to keep raising the bar. We're committed to making every investment cycle as seamless as the last. Here's to many more successful payouts! 🙌",
      date: "02/04/2026",
    },
  },
  {
    id: "4",
    author: "Michael Murphy",
    date: "02/25/2026",
    rating: 4,
    title: "A good investment company to me means…",
    content:
      "A company that delivers on their services not minding the low chances of market opportunities presented. And my experience with them from the first day have been very much profitable hence I wish to top-up my investment amount as I see a promising future with them.",
    verified: true,
    likes: 14,
    adminResponse: {
      message:
        "We truly appreciate your trust, Michael! Delivering consistent results regardless of market conditions is what we strive for every day. We're glad your experience has been profitable and we look forward to supporting your continued growth. Thank you for believing in IAMVERSE! 📈",
      date: "02/26/2026",
    },
  },
  {
    id: "5",
    author: "Lars Hendriks",
    date: "03/05/2026",
    rating: 5,
    title: "As an immigrant in Western Europe",
    content:
      "As an immigrant in western Europe, it hasn't been easy to find a better life, but since I invested in this company they have really assisted my financial life. With the little I make in my investment with them, in few days I made more with them and the best part of this company is I can withdraw anytime any day 24/7.",
    verified: true,
    likes: 27,
    adminResponse: {
      message:
        "Your story truly touches us, Lars. We built IAMVERSE to empower people from all walks of life, and knowing we've made a positive difference for you motivates us to do even better. Our 24/7 withdrawal system is designed for exactly this — giving you full control of your earnings at all times. Thank you for trusting us! 🌍",
      date: "03/06/2026",
    },
  },
  {
    id: "6",
    author: "Axel Nilsson",
    date: "03/06/2026",
    rating: 4,
    title: "Ever since I started investing here…",
    content:
      "Ever since I started investing here I have never been told to pay any fee for withdrawal unlike many platforms. Just received my withdrawal of $17,000 last week without any delay, planning to move to the Business plan soon.",
    verified: true,
    likes: 22,
    adminResponse: {
      message:
        "Thank you for the wonderful feedback, Axel! We're proud to offer zero withdrawal fees — your earnings are yours, period. We're excited to hear you're considering the Business plan and we'll be here to support you every step of the way. Keep thriving! 💰",
      date: "03/07/2026",
    },
  },
  {
    id: "7",
    author: "Najiyulla Duysenbaev",
    date: "03/09/2026",
    rating: 5,
    title: "Hello everyone 👋 I've been using this…",
    content:
      "Hello everyone 👋 I've been using this crypto arbitrage platform for a while, and it's honestly one of the best I've tried. The interface is simple, transactions are fast, and profits come quickly from price differences between exchanges. Totally reliable and transparent service — highly recommend to anyone interested in crypto trading!",
    verified: true,
    likes: 19,
    adminResponse: {
      message:
        "We're so glad you're enjoying the platform, Najiyulla! Our team works tirelessly to keep the interface intuitive and transactions lightning-fast. Your recommendation means a lot to us and we promise to keep delivering the quality you deserve. Welcome to the IAMVERSE family! 🚀",
      date: "03/10/2026",
    },
  },
  {
    id: "8",
    author: "Junaid Adam",
    date: "03/11/2026",
    rating: 4,
    title: "Solid platform with real results",
    content:
      "I was skeptical at first like many others, but after my first successful withdrawal I knew this was the real deal. The support team is responsive and the investment plans are straightforward. I've been here for a few months now and my portfolio has grown steadily. Only reason it's not 5 stars is I'd love to see a mobile app in the future, but overall a great experience.",
    verified: true,
    likes: 16,
    adminResponse: {
      message:
        "Thank you for the honest review, Junaid! We're thrilled your portfolio is growing steadily. Your feedback about a mobile app is noted — we're always working to improve and expand our services. Stay tuned for exciting updates ahead. We appreciate your continued trust! 📱✨",
      date: "03/12/2026",
    },
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }: { review: Review }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes);

  const handleLike = () => {
    if (!liked) {
      setLikeCount((c) => c + 1);
      setLiked(true);
    } else {
      setLikeCount((c) => c - 1);
      setLiked(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {review.author}
            </span>
            {review.verified && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{review.date}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Content */}
      <div>
        <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {review.content}
        </p>
      </div>

      {/* Like button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          liked
            ? "text-primary font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ThumbsUp className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
        <span>Helpful ({likeCount})</span>
      </button>

      {/* Admin response */}
      {review.adminResponse && (
        <div className="ml-4 pl-4 border-l-2 border-primary/30 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              IAMVERSE Team
            </span>
            <span className="text-xs text-muted-foreground">
              {review.adminResponse.date}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {review.adminResponse.message}
          </p>
        </div>
      )}
    </div>
  );
};

export const Reviews = () => {
  return (
    <section id="reviews" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Investors Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real reviews from verified members of the IAMVERSE community.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <StarRating rating={5} />
            <span className="text-sm text-muted-foreground font-medium">
              4.9 / 5 based on 1,200+ reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};
