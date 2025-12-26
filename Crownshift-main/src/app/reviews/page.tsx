'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getApprovedReviews } from '@/app/actions';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  serviceId: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: any;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const result = await getApprovedReviews();
        if (result.success) {
          setReviews(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="py-12 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4">Customer Reviews</h1>
              <p className="text-lg text-muted-foreground">
                See what our customers have to say about our services
              </p>
            </div>

            {/* Statistics Cards */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Average Rating Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Average Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold">{averageRating}</div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.round(parseFloat(averageRating as string))
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on {totalReviews} reviews
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Reviews Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Total Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold mb-4">{totalReviews}</div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-12">{rating} ★</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width: `${
                                  totalReviews > 0
                                    ? (ratingDistribution[rating as keyof typeof ratingDistribution] /
                                        totalReviews) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {ratingDistribution[rating as keyof typeof ratingDistribution]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Recent Reviews</h2>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No reviews yet. Be the first to share your experience!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{review.userName}</CardTitle>
                            <CardDescription>
                              {review.createdAt
                                ? new Date(
                                    review.createdAt.toDate?.() || review.createdAt
                                  ).toLocaleDateString()
                                : 'Recently'}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
