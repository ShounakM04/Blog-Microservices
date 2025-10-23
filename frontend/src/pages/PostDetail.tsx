import { useState, useEffect,type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { postApi, commentApi, likeApi } from '../api/axios';
import { type Post, type Comment } from '../types';
import { useAuth } from '../hooks/useAuth';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Parallel fetching
        const [postRes, commentsRes, likeCountRes, hasLikedRes] = await Promise.all([
          postApi.get(`/posts/${id}`),
          commentApi.get(`/comments/post/${id}`),
          likeApi.get(`/likes/post/${id}/count`),
          user ? likeApi.get(`/likes/post/${id}/liked`) : Promise.resolve({ data: { liked: false } })
        ]);

        setPost(postRes.data);
        setComments(commentsRes.data);
        setLikeCount(likeCountRes.data.count);
        setHasLiked(hasLikedRes.data.liked);

      } catch (error) {
        console.error("Failed to fetch post details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !id) return;
    try {
      if (hasLiked) {
        await likeApi.delete('/likes', { data: { postId: id } });
        setLikeCount(prev => prev - 1);
      } else {
        await likeApi.post('/likes', { postId: id });
        setLikeCount(prev => prev + 1);
      }
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Failed to update like status:", error);
    }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    try {
      const response = await commentApi.post('/comments', { postId: id, content: newComment });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading post...</div>;
  if (!post) return <div className="text-center mt-10 text-red-500">Post not found.</div>;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-4 text-gray-900">{post.title}</h1>
      <p className="text-gray-500 mb-6">Published on {new Date(post.createdAt).toLocaleDateString()}</p>
      
      <div className="prose lg:prose-xl max-w-none mb-8 text-gray-800">
        {post.content}
      </div>

      {/* Likes Section */}
      <div className="flex items-center space-x-4 border-t border-b py-4 mb-8">
        <button 
          onClick={handleLike} 
          disabled={!user}
          className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-colors ${
            hasLiked 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>❤️</span>
          <span>{hasLiked ? 'Liked' : 'Like'}</span>
        </button>
        <span className="font-semibold text-gray-700">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
      </div>

      {/* Comments Section */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Comments ({comments.length})</h3>
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add your comment..."
              rows={3}
            />
            <button type="submit" className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Post Comment
            </button>
          </form>
        ) : <p className="text-gray-600 mb-6">Please log in to comment.</p>}
        
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">{comment.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Commented on {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;