import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Section } from './Shared';

interface Review {
  id: string;
  client_name: string;
  rating: number;
  comment: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    client_name: 'أبو فهد العتيبي',
    rating: 5,
    comment: 'تجربة ممتازة وسريعة، تم إنهاء إجراءات إعفائي بكل مصداقية وسلاسة.',
  },
  {
    id: 'rev-2',
    client_name: 'سارة القحطاني',
    rating: 5,
    comment: 'فريق عمل محترف يقدم استشارات وحلول مالية دقيقة وواضحة جداً.',
  },
  {
    id: 'rev-3',
    client_name: 'خالد المطيري',
    rating: 5,
    comment: 'تمت إعادة جدولة تمويلي وتخفيض الأقساط الشهرية بوقت قياسي، شكراً ريفانس.',
  },
  {
    id: 'rev-4',
    client_name: 'محمد الدوسري',
    rating: 5,
    comment: 'خدمة راقية ومتابعة مستمرة خطوة بخطوة حتى تم إنهاء المعاملة.',
  },
  {
    id: 'rev-5',
    client_name: 'أم عبد العزيز الحربي',
    rating: 5,
    comment: 'أفضل شركة تعاملت معها، ثقة واحترافية وتجاوب سريع.',
  },
];

const StarRating = React.forwardRef<HTMLDivElement, { rating: number; size?: number }>(
  ({ rating, size = 15 }, ref) => (
    <div ref={ref} className="flex gap-1" aria-label={`تقييم ${rating} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-[#c5a059] fill-[#c5a059]' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </div>
  )
);

StarRating.displayName = 'StarRating';

const ReviewCard = React.forwardRef<HTMLDivElement, { review: Review }>(({ review }, ref) => (
  <div
    ref={ref}
    dir="rtl"
    className="w-[83vw] max-w-[320px] sm:w-[300px] md:w-[320px] shrink-0 snap-start bg-white dark:bg-[#15031d] rounded-2xl border border-gold/30 dark:border-white/10 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col transition-all duration-200"
  >
    {/* 1. اسم العميل */}
    <span className="text-[14px] sm:text-[15px] font-bold text-[#240738] dark:text-gray-100 text-right">
      {review.client_name}
    </span>

    {/* 2. النجوم أسفل الاسم مباشرة */}
    <div className="mt-1.5 flex justify-start">
      <StarRating rating={review.rating} size={15} />
    </div>

    {/* 3. نص التقييم أسفل النجوم بمحاذاة اليمين */}
    <p className="mt-2.5 text-[13px] sm:text-[14px] leading-relaxed text-gray-700 dark:text-gray-300 font-medium text-right line-clamp-4 select-none">
      {review.comment}
    </p>
  </div>
));

ReviewCard.displayName = 'ReviewCard';

const ClientReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('client_reviews')
          .select('id, client_name, rating, comment')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setReviews(data as Review[]);
        } else {
          setReviews(DEFAULT_REVIEWS);
        }
      } catch (err) {
        setReviews(DEFAULT_REVIEWS);
      }
    };

    fetchReviews();
  }, []);

  // Update active dot index upon scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || reviews.length === 0) return;

    const cards = container.children;
    if (!cards || cards.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerRight = containerRect.right;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const cardRect = card.getBoundingClientRect();
      // In RTL, the active card aligns with the right boundary of the container
      const distance = Math.abs(cardRect.right - containerRight);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    setActiveIndex(closestIndex);
  }, [reviews.length]);

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = container.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    }
  };

  if (reviews.length === 0) return null;

  return (
    <Section id="client-reviews">
      <div className="w-full">
        {/* 1. رأس القسم: محاذاة لليمين RTL، مسافة صغيرة بين العنوان والوصف، ألوان الهوية الأصلية */}
        <div className="text-right space-y-1 mb-4 sm:mb-5">
          <h2 className="text-[16px] sm:text-2xl md:text-3xl font-black text-[#240738] dark:text-white leading-snug tracking-tight">
            تقييمات عملائنا
          </h2>
          <p className="text-[13.5px] sm:text-base font-bold text-[#c5a059] dark:text-gold leading-relaxed">
            تجارب حقيقية من عملاء استفادوا من خدماتنا
          </p>
        </div>

        {/* 2. سلايدر التقييمات: RTL دقيق، بطاقة رئيسية واضحة مع Peek صغير للبطاقة التالية، سناب ناعم */}
        <div className="relative w-full overflow-hidden">
          <div
            ref={scrollContainerRef}
            dir="rtl"
            onScroll={handleScroll}
            className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 focus:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {/* End spacing spacer to ensure last card doesn't touch the screen edge */}
            <div className="w-1 shrink-0" aria-hidden="true" />
          </div>
        </div>

        {/* 3. مؤشر السلايدر: نقاط متناسقة أسفل البطاقات مباشرة وتتحدث تلقائياً */}
        {reviews.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-3 sm:mt-4">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`الانتقال إلى التقييم ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? 'w-5 h-2 bg-[#c5a059] shadow-xs'
                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

export default ClientReviews;
export { StarRating };

