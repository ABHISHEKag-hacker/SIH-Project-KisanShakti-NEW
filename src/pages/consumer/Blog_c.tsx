// src/pages/consumer/Blog_c.tsx

import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Heart, PlusCircle, Trash2, Edit } from 'lucide-react';

interface BlogPageProps {
  currentUser: any; 
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  authorId: string;
  date: any; 
  excerpt: string;
  content: string;
  likes: string[];
}

const Blog_c: React.FC<BlogPageProps> = ({ currentUser }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', excerpt: '', content: '' });
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
        const postsCollectionRef = collection(db, 'blogPosts');
        const querySnapshot = await getDocs(postsCollectionRef);
        const posts: BlogPost[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            posts.push({ 
                id: doc.id, 
                ...data,
                date: data.date?.toDate().toLocaleDateString() // Format timestamp
            } as BlogPost);
        });
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBlogPosts(posts);
    } catch (err) {
        console.error("Error fetching blog posts: ", err);
        setError('Failed to load blog posts. Please try again later.');
    } finally {
        setLoading(false);
    }
};

const handleLike = async (postId: string) => {
    if (!currentUser) return;

    const postRef = doc(db, 'blogPosts', postId);
    const post = blogPosts.find(p => p.id === postId);
    
    if (post) {
      const alreadyLiked = post.likes.includes(currentUser.uid);
      
      try {
        if (alreadyLiked) {
          await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
        } else {
          await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
        }
        fetchPosts(); // Re-fetch for updated data
      } catch (error) {
        console.error("Error updating like: ", error);
      }
    }
  };

  const handleSavePost = async () => {
      if (!newPost.title || !newPost.content) {
          alert("Title and content are required.");
          return;
      }
      setLoading(true);
      try {
          if (editingPost) {
              const postRef = doc(db, 'blogPosts', editingPost.id);
              await updateDoc(postRef, { ...newPost });
          } else {
            await addDoc(collection(db, 'blogPosts'), {
                ...newPost,
                author: currentUser.name,
                authorId: currentUser.uid,
                date: serverTimestamp(),
                likes: [],
            });
          }
          setShowModal(false);
          setNewPost({ title: '', excerpt: '', content: '' });
          setEditingPost(null);
          fetchPosts();
      } catch (error) {
          console.error("Error saving post:", error);
      } finally {
          setLoading(false);
      }
  }

  const handleDeletePost = async (postId: string) => {
      if (window.confirm("Are you sure you want to delete this post?")) {
          try {
              await deleteDoc(doc(db, "blogPosts", postId));
              fetchPosts();
          } catch (error) {
              console.error("Error deleting post:", error);
          }
      }
  }

  const openEditModal = (post: BlogPost) => {
      setEditingPost(post);
      setNewPost({ title: post.title, excerpt: post.excerpt, content: post.content });
      setShowModal(true);
  }

  if (loading && !showModal) {
    return <div className="text-center py-20">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
       <header className="bg-white dark:bg-gray-800 shadow-sm">
         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
           <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Community Blog
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">
              Share your stories and learn from others.
            </p>
           </div>
           <button 
              onClick={() => { setEditingPost(null); setNewPost({ title: '', excerpt: '', content: '' }); setShowModal(true); }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusCircle size={20} />
              Add New Post
            </button>
         </div>
       </header>
       <main>
         <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
           <div className="grid gap-12 lg:grid-cols-3">
             {blogPosts.map((post) => {
               const isLiked = currentUser && post.likes.includes(currentUser.uid);
               const isAuthor = currentUser && post.authorId === currentUser.uid;
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
                    </div>
                    {isAuthor && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(post)} className="p-2 text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                            <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                        </div>
                    )}
                  </div>
                </div>
               )
              })}
           </div>
         </div>
       </main>

       {showModal && (
           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                   <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">{editingPost ? 'Edit Post' : 'Create a New Post'}</h3>
                   </div>
                   <div className="p-6 space-y-4">
                        <input type="text" placeholder="Title" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="input w-full" />
                        <input type="text" placeholder="Excerpt (a short summary)" value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="input w-full" />
                        <textarea placeholder="Write your full blog content here..." value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="input w-full" rows={8}></textarea>
                   </div>
                   <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
                       <button onClick={() => setShowModal(false)} className="button-secondary px-4 py-2">Cancel</button>
                       <button onClick={handleSavePost} disabled={loading} className="button-primary px-4 py-2">{loading ? 'Saving...' : 'Save Post'}</button>
                   </div>
               </div>
           </div>
       )}
     </div>
  );
};

export default Blog_c;