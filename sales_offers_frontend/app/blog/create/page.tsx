"use client";

import { useState } from "react";
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
    image: ""
  });
  const [loading, setLoading] = useState(false);

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