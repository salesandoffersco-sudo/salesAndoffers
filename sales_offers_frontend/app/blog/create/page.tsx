"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { Editor } from '@tinymce/tinymce-react';
import Button from "../../../components/Button";
import BlogImageUpload from "../../../components/BlogImageUpload";
import { API_BASE_URL } from "../../../lib/api";

export default function CreateBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    category_id: "",
    subcategory_id: ""
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blog/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);
    setSubcategories(selectedCategory?.subcategories || []);
    setFormData({
      ...formData,
      category_id: categoryId,
      subcategory_id: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/blog/posts/`,
        formData,
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      router.push(`/blog/${response.data.slug}`);
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.error || "Failed to create post");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blog
          </button>
        </div>

        <div className="bg-[rgb(var(--color-card))] rounded-2xl shadow-lg border border-[rgb(var(--color-border))] p-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-8">Create New Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your post title..."
              />
            </div>

            <BlogImageUpload
              currentImage={formData.image}
              onImageChange={(url) => setFormData({ ...formData, image: url })}
              label="Featured Image"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                  Subcategory (Optional)
                </label>
                <select
                  id="subcategory"
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                  disabled={!formData.category_id}
                  className="w-full px-4 py-3 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                Content
              </label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                value={formData.content}
                onEditorChange={(content) => setFormData({ ...formData, content })}
                onInit={(evt, editor) => {
                  // Editor initialization complete
                }}
                init={{
                  height: 500,
                  menubar: 'file edit view insert format tools table help',
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
                    'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc',
                    'imagetools', 'textpattern', 'noneditable', 'quickbars', 'accordion'
                  ],
                  toolbar1: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
                    'forecolor backcolor | alignleft aligncenter alignright alignjustify',
                  toolbar2: 'bullist numlist outdent indent | link image media table | ' +
                    'hr pagebreak | code codesample | emoticons charmap | fullscreen preview help',
                  image_advtab: true,
                  image_uploadtab: true,
                  file_picker_types: 'image media',
                  automatic_uploads: true,
                  images_upload_handler: async (blobInfo: any) => {
                    const formData = new FormData();
                    const filename = `blog/images/editor-${Date.now()}.${blobInfo.blob().name.split('.').pop()}`;
                    
                    try {
                      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                        method: 'POST',
                        body: blobInfo.blob(),
                      });
                      
                      if (!response.ok) throw new Error('Upload failed');
                      
                      const result = await response.json();
                      return result.url;
                    } catch (error) {
                      throw new Error('Image upload failed');
                    }
                  },
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.6; }',
                  skin: 'oxide',
                  content_css: 'default',
                  branding: false
                }}
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FiSave className="mr-2" />
                    Publish Post
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}