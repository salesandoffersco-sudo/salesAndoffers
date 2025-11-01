"use client";

import Link from "next/link";
import { FiMessageCircle, FiSend, FiUser, FiChevronDown, FiChevronRight, FiCornerDownRight } from "react-icons/fi";
import Button from "./Button";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

interface Comment {
  id: number;
  user: User;
  content: string;
  created_at: string;
  replies?: Comment[];
  parent_id?: number;
}

interface BlogPost {
  id: number;
  title: string;
  comments_count: number;
}

interface CommentsSidebarProps {
  post: BlogPost;
  comments: Comment[];
  newComment: string;
  setNewComment: (value: string) => void;
  replyingTo: number | null;
  setReplyingTo: (value: number | null) => void;
  replyContent: string;
  setReplyContent: (value: string) => void;
  expandedReplies: Set<number>;
  toggleReplies: (commentId: number) => void;
  handleComment: (e: React.FormEvent) => void;
  handleReply: (e: React.FormEvent, parentId: number) => void;
  isLoggedIn: boolean;
  formatDateTime: (dateString: string) => string;
  isMobile?: boolean;
}

export default function CommentsSidebar({
  post,
  comments,
  newComment,
  setNewComment,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  expandedReplies,
  toggleReplies,
  handleComment,
  handleReply,
  isLoggedIn,
  formatDateTime,
  isMobile = false
}: CommentsSidebarProps) {
  const topLevelComments = comments.filter(comment => !comment.parent_id);

  return (
    <div className={`bg-[rgb(var(--color-card))] rounded-2xl border border-[rgb(var(--color-border))] ${isMobile ? 'p-6' : 'p-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-semibold text-[rgb(var(--color-text))] ${isMobile ? 'text-2xl' : 'text-lg'}`}>
          {isMobile ? 'Discussion' : 'Comments'}
        </h3>
        <div className="text-[rgb(var(--color-muted))] text-sm">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {/* Comment Form */}
      {isLoggedIn ? (
        <form onSubmit={handleComment} className="mb-6">
          <div className="bg-[rgb(var(--color-bg))] rounded-xl p-4 border border-[rgb(var(--color-border))]">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isMobile ? "Join the discussion..." : "Add a comment..."}
              rows={isMobile ? 4 : 3}
              className="w-full px-0 py-0 border-0 bg-transparent text-[rgb(var(--color-text))] placeholder-[rgb(var(--color-muted))] focus:ring-0 focus:outline-none resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgb(var(--color-border))]">
              <div className="text-xs text-[rgb(var(--color-muted))]">
                Be respectful
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                size="sm"
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <FiSend className="w-3 h-3 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl border border-[rgb(var(--color-border))] text-center">
          <FiMessageCircle className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--color-muted))]" />
          <p className="text-sm text-[rgb(var(--color-muted))] mb-3">Sign in to join the discussion</p>
          <Link href="/login">
            <Button variant="primary" size="sm">Sign In</Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <div key={comment.id} className="group">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {comment.user.profile_picture ? (
                    <img src={comment.user.profile_picture} alt={comment.user.username} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-[rgb(var(--color-bg))] rounded-xl p-3 border border-[rgb(var(--color-border))] group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-[rgb(var(--color-text))] text-sm">
                      {comment.user.first_name} {comment.user.last_name}
                    </span>
                    <span className="text-xs text-[rgb(var(--color-muted))]">
                      {formatDateTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-[rgb(var(--color-text))] text-sm leading-relaxed mb-3">{comment.content}</p>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center space-x-3 text-xs">
                    {isLoggedIn && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-[rgb(var(--color-muted))] hover:text-purple-600 transition-colors"
                      >
                        Reply
                      </button>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center space-x-1 text-[rgb(var(--color-muted))] hover:text-purple-600 transition-colors"
                      >
                        {expandedReplies.has(comment.id) ? (
                          <FiChevronDown className="w-3 h-3" />
                        ) : (
                          <FiChevronRight className="w-3 h-3" />
                        )}
                        <span>{comment.replies.length}</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleReply(e, comment.id)} className="mt-3 ml-2">
                    <div className="bg-[rgb(var(--color-card))] rounded-lg p-3 border border-[rgb(var(--color-border))]">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${comment.user.first_name}...`}
                        rows={2}
                        className="w-full px-0 py-0 border-0 bg-transparent text-[rgb(var(--color-text))] placeholder-[rgb(var(--color-muted))] focus:ring-0 focus:outline-none resize-none text-sm"
                      />
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgb(var(--color-border))]">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                          className="text-xs text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors"
                        >
                          Cancel
                        </button>
                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="sm"
                          disabled={!replyContent.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
                
                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                  <div className="mt-3 ml-4 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-2">
                        <FiCornerDownRight className="w-3 h-3 text-[rgb(var(--color-muted))] mt-2 flex-shrink-0" />
                        <div className="flex space-x-2 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                              {reply.user.profile_picture ? (
                                <img src={reply.user.profile_picture} alt={reply.user.username} className="w-full h-full object-cover" />
                              ) : (
                                <FiUser className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-[rgb(var(--color-card))] rounded-lg p-2 border border-[rgb(var(--color-border))]">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-[rgb(var(--color-text))] text-xs">
                                  {reply.user.first_name} {reply.user.last_name}
                                </span>
                                <span className="text-xs text-[rgb(var(--color-muted))]">
                                  {formatDateTime(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-[rgb(var(--color-text))] text-xs leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {topLevelComments.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMessageCircle className="w-8 h-8 text-[rgb(var(--color-muted))]" />
          </div>
          <h4 className="font-medium text-[rgb(var(--color-text))] mb-2">No comments yet</h4>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
}