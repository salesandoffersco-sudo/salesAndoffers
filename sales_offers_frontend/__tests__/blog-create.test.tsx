import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CreateBlogPage from '../app/blog/create/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CreateBlogPage', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'username') return 'testuser';
      return null;
    });

    // Mock successful subscription fetch
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/sellers/stats/')) {
        return Promise.resolve({
          data: {
            subscription: {
              plan: {
                features: { blog_posts: 20 }
              }
            }
          }
        });
      }
      if (url.includes('/api/blog/posts/')) {
        return Promise.resolve({
          data: [
            { id: 1, title: 'Existing Post', author: { username: 'testuser' } }
          ]
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders blog creation form', async () => {
    render(<CreateBlogPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter an engaging title...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Write your story here...')).toBeInTheDocument();
      expect(screen.getByText('Publish Post')).toBeInTheDocument();
    });
  });

  test('shows subscription limits', async () => {
    render(<CreateBlogPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Posts used: 1\/20/)).toBeInTheDocument();
    });
  });

  test('handles form submission successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { slug: 'test-blog-post' }
    });

    render(<CreateBlogPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter an engaging title...')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter an engaging title...'), {
      target: { value: 'Test Blog Post' }
    });
    fireEvent.change(screen.getByPlaceholderText('Write your story here...'), {
      target: { value: 'This is test content for the blog post.' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Publish Post'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/blog/posts/'),
        {
          title: 'Test Blog Post',
          content: 'This is test content for the blog post.',
          image: null
        },
        { headers: { Authorization: 'Token mock-token' } }
      );
      expect(mockPush).toHaveBeenCalledWith('/blog/test-blog-post');
    });
  });

  test('handles form validation', async () => {
    render(<CreateBlogPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Publish Post')).toBeInTheDocument();
    });

    // Try to submit empty form
    const submitButton = screen.getByText('Publish Post');
    expect(submitButton).toBeDisabled();

    // Fill only title
    fireEvent.change(screen.getByPlaceholderText('Enter an engaging title...'), {
      target: { value: 'Test Title' }
    });
    expect(submitButton).toBeDisabled();

    // Fill content too
    fireEvent.change(screen.getByPlaceholderText('Write your story here...'), {
      target: { value: 'Test content' }
    });
    expect(submitButton).not.toBeDisabled();
  });

  test('handles subscription limit reached', async () => {
    // Mock user at limit
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/sellers/stats/')) {
        return Promise.resolve({
          data: {
            subscription: {
              plan: {
                features: { blog_posts: 2 }
              }
            }
          }
        });
      }
      if (url.includes('/api/blog/posts/')) {
        return Promise.resolve({
          data: [
            { id: 1, title: 'Post 1', author: { username: 'testuser' } },
            { id: 2, title: 'Post 2', author: { username: 'testuser' } }
          ]
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<CreateBlogPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Blog Post Limit Reached/)).toBeInTheDocument();
      expect(screen.getByText(/You've used 2\/2 posts/)).toBeInTheDocument();
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
    });

    // Submit button should be disabled
    const submitButton = screen.getByText('Publish Post');
    expect(submitButton).toBeDisabled();
  });
});