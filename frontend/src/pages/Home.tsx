import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postApi } from '../api/axios';
import { type Post } from '../types';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postApi.get('/posts');
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading posts...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Latest Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">{post.title}</h2>
              <p className="text-gray-700 mb-4">{post.content.substring(0, 100)}...</p>
              <Link to={`/post/${post._id}`} className="text-blue-600 font-semibold hover:underline">
                Read More &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;