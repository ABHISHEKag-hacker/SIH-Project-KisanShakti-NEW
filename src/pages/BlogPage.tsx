// src/pages/BlogPage.tsx

import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase'; // Ensure you have this export in your firebase config
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Heart, MessageSquare, Send, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Assumption: You pass the currently logged-in user to this component
interface BlogPageProps {
  currentUser: any; 
}

// Define a more detailed structure for a blog post
interface BlogPost {
  id: string;
  title: string;
  author: string;
  authorId: string;
  date: string; // Consider using Firestore Timestamps for better sorting
  excerpt: string;
  content: string; // Full content for the blog post
  likes: string[]; // Array of user UIDs who have liked the post
}

const BlogPage: React.FC<BlogPageProps> = ({ currentUser }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the current user is an admin/consumer
  // In a real app, you'd have a 'role' field in the user's Firestore document
  const isAdmin = currentUser && currentUser.role === 'admin';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollectionRef = collection(db, 'blogPosts');
        const querySnapshot = await getDocs(postsCollectionRef);
        const posts: BlogPost[] = [];
        querySnapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() } as BlogPost);
        });
        // Sort by date, newest first (assuming date is in a sortable format like YYYY-MM-DD)
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBlogPosts(posts);
      } catch (err) {
        console.error("Error fetching blog posts: ", err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    if (!currentUser) return; // Must be logged in to like

    const postRef = doc(db, 'blogPosts', postId);
    const post = blogPosts.find(p => p.id === postId);
    
    if (post) {
      const alreadyLiked = post.likes.includes(currentUser.uid);
      
      try {
        if (alreadyLiked) {
          // Unlike the post
          await updateDoc(postRef, {
            likes: arrayRemove(currentUser.uid)
          });
          // Update state locally for immediate feedback
          setBlogPosts(blogPosts.map(p => 
            p.id === postId ? { ...p, likes: p.likes.filter(uid => uid !== currentUser.uid) } : p
          ));
        } else {
          // Like the post
          await updateDoc(postRef, {
            likes: arrayUnion(currentUser.uid)
          });
           // Update state locally
           setBlogPosts(blogPosts.map(p => 
            p.id === postId ? { ...p, likes: [...p.likes, currentUser.uid] } : p
          ));
        }
      } catch (error) {
        console.error("Error updating like: ", error);
        // Optionally show an error to the user
      }
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
       <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
           <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kisan Shakti Blog
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">
              News, insights, and advice for the modern farmer.
            </p>
           </div>
           {/* Show "Add Post" button only if the user is an admin */}
           {isAdmin && (
            <Link 
              to="/blog/new" // We will create this route later
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusCircle size={20} />
              Add New Post
            </Link>
           )}
         </div>
       </header>
       <main>
         <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
           <div className="grid gap-12 lg:grid-cols-3">
             {blogPosts.map((post) => {
               const isLiked = currentUser && post.likes.includes(currentUser.uid);
               return (
                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <div className="p-8 flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {post.title}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>By {post.author}</span>
                      <span className="mx-2">&bull;</span>
                      <span>{post.date}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
                        >
                          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> 
                          <span className="font-semibold">{post.likes.length}</span>
                        </button>
                        {/* Future feature: comments */}
                        {/* <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500">
                           <MessageSquare size={20} /> 
                           <span className="font-semibold">0</span>
                        </button> */}
                    </div>
                    <a href="#" className="font-semibold text-green-600 dark:text-green-400 hover:underline">
                      Read More &rarr;
                    </a>
                  </div>
                </div>
               )
              })}
           </div>
         </div>
       </main>
     </div>
  );
};

export default BlogPage;