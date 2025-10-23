"use client";

import { useState, useEffect } from "react";
import { FiStar, FiMessageCircle, FiUser, FiCalendar, FiFilter } from "react-icons/fi";
import Button from "../../../components/Button";
import { api } from "../../../lib/api";

interface Review {
  id: number;
  customer_name: string;
  customer_avatar?: string;
  rating: number;
  comment: string;
  deal_title: string;
  created_at: string;
  response?: string;
  responded_at?: string;
}

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Mock data since backend endpoint doesn't exist yet
      const mockReviews: Review[] = [
        {
          id: 1,
          customer_name: "John Doe",
          rating: 5,
          comment: "Excellent service! The deal was exactly as described and the redemption process was smooth.",
          deal_title: "Premium Wireless Headphones - 30% OFF",
          created_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          customer_name: "Jane Smith", 
          rating: 4,
          comment: "Good deal, but delivery took longer than expected. Overall satisfied with the product quality.",
          deal_title: "Smart Fitness Watch - 25% OFF",
          created_at: "2024-01-14T15:45:00Z",
          response: "Thank you for your feedback! We're working on improving our delivery times.",
          responded_at: "2024-01-14T16:00:00Z"
        },
        {
          id: 3,
          customer_name: "Mike Johnson",
          rating: 3,
          comment: "The product was okay but not as premium as advertised. Price was fair though.",
          deal_title: "Professional Camera - 35% OFF", 
          created_at: "2024-01-13T09:15:00Z"
        }
      ];
      setReviews(mockReviews);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      // Mock API call - would be: await api.post(`/api/reviews/${selectedReview.id}/respond/`, { response: responseText });
      setReviews(reviews.map(review => 
        review.id === selectedReview.id 
          ? { ...review, response: responseText, responded_at: new Date().toISOString() }
          : review
      ));
      setShowResponseModal(false);
      setResponseText("");
      setSelectedReview(null);
    } catch (error) {
      console.error("Error responding to review:", error);
    }
  };

  const filteredReviews = reviews.filter(review => 
    filterRating === "all" || review.rating.toString() === filterRating
  );

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }));

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">Customer Reviews</h1>
            <p className="text-[rgb(var(--color-muted))] mt-2">Manage and respond to customer feedback</p>
          </div>
        </div>

        {/* Reviews Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(parseFloat(averageRating)) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-[rgb(var(--color-muted))]">Average Rating</p>
              <p className="text-sm text-[rgb(var(--color-muted))]">Based on {reviews.length} reviews</p>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">Rating Breakdown</h3>
            <div className="space-y-2">
              {ratingCounts.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-[rgb(var(--color-muted))] w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
            <h3 className="font-semibold text-[rgb(var(--color-text))] mb-4">Response Rate</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {reviews.length > 0 ? Math.round((reviews.filter(r => r.response).length / reviews.length) * 100) : 0}%
              </div>
              <p className="text-[rgb(var(--color-muted))]">
                {reviews.filter(r => r.response).length} of {reviews.length} reviews responded
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 mb-6 border border-[rgb(var(--color-border))]">
          <div className="flex items-center gap-4">
            <FiFilter className="text-[rgb(var(--color-muted))]" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--color-muted))]">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-20">
            <FiMessageCircle className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-2">No reviews found</h3>
            <p className="text-[rgb(var(--color-muted))]">
              {filterRating !== "all" ? "No reviews match your filter" : "You haven't received any reviews yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FiUser className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[rgb(var(--color-text))]">{review.customer_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-[rgb(var(--color-muted))]">
                          <FiCalendar className="inline w-3 h-3 mr-1" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!review.response && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setShowResponseModal(true);
                      }}
                    >
                      <FiMessageCircle className="w-4 h-4 mr-1" />
                      Respond
                    </Button>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-[rgb(var(--color-muted))] mb-2">Review for: {review.deal_title}</p>
                  <p className="text-[rgb(var(--color-text))]">{review.comment}</p>
                </div>

                {review.response && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-purple-600">Your Response</span>
                      <span className="text-xs text-[rgb(var(--color-muted))]">
                        {new Date(review.responded_at!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[rgb(var(--color-text))]">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--color-card))] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[rgb(var(--color-border))]">
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">Respond to Review</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.customer_name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${i < selectedReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[rgb(var(--color-text))]">{selectedReview.comment}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write a professional response to this review..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText("");
                    setSelectedReview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleResponse}
                  disabled={!responseText.trim()}
                >
                  Send Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}