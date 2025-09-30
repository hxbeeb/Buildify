import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import { FaMagic, FaCogs } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ file: File; description: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [cloudinaryUrlInput, setCloudinaryUrlInput] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');
  const [cloudinaryPresetInput, setCloudinaryPresetInput] = useState('');
  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setImages([]);
      return;
    }
    const newImages = files.map((file) => ({ file, description: '' }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDescriptionChange = (index: number, desc: string) => {
    const updated = [...images];
    updated[index].description = desc;
    setImages(updated);
  };

  const handleUploadAllImages = async () => {
    const uploaded: { url: string; description: string }[] = [];

    for (const img of images) {
      const formData = new FormData();
      formData.append('file', img.file);
      if (cloudinaryPreset) {
        formData.append('upload_preset', cloudinaryPreset);
      }
      try {
        const res = await axios.post(
          cloudinaryUrl,
          formData
        );
        uploaded.push({
          url: res.data.secure_url,
          description: img.description
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    return uploaded;
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!prompt.trim()) return;

//     setUploading(true);
//     const uploadedImages = await handleUploadAllImages();
//     setUploading(false);


//     console.log("Navigating to /builder with:");
// console.log("Prompt:", prompt);
// console.log("Images:", uploadedImages);

//     navigate('/builder', {
//       state: {
//         prompt,
//         images: uploadedImages
//       }
//     });
//   };


const getIsPro = () => {
  try {
    const pub = (user as any)?.publicMetadata;
    const priv = (user as any)?.privateMetadata;
    const plan = (pub?.plan || priv?.plan || '').toString().toLowerCase();
    return plan === 'pro' || plan === 'team' || plan === 'enterprise';
  } catch {
    return false;
  }
};

const getUsageKey = () => `builder:usage:${(user as any)?.id || 'anon'}`;

const getLast24hCount = () => {
  const key = getUsageKey();
  const raw = localStorage.getItem(key);
  const arr: number[] = raw ? JSON.parse(raw) : [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = arr.filter(ts => ts > cutoff);
  // persist cleaned list
  localStorage.setItem(key, JSON.stringify(recent));
  return recent.length;
};

const recordUsageNow = () => {
  const key = getUsageKey();
  const raw = localStorage.getItem(key);
  const arr: number[] = raw ? JSON.parse(raw) : [];
  arr.push(Date.now());
  localStorage.setItem(key, JSON.stringify(arr));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!prompt.trim()) return;
  if (!user) {
    toast.error('Please log in to get started!', { position: 'top-center' });
    return;
  }

  // Enforce free plan rate limit: max 1 query per 24h
  const isPro = getIsPro();
  const used = getLast24hCount();
  if (!isPro && used >= 1) {
    toast.error('Free plan limit reached (1 request / 24h). Upgrade to Pro to continue.', { position: 'top-center' });
    // Optionally scroll to pricing
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  setUploading(true);
  const uploadedImages = await handleUploadAllImages();
  setUploading(false);

  // Build formatted image instructions
  let imageInstructions = '\n\nUse the following image URLs for website generation. Each image is associated with a specific section:\n';
  uploadedImages.forEach((img, index) => {
    imageInstructions += `Image ${index + 1}: ${img.description}\nURL: ${img.url}\n`;
  });

  const finalPrompt = `${prompt.trim()}\n\n${imageInstructions}\nPlease make sure the AI uses these images according to their descriptions in the website layout.Also in the image tag add this crossOrigin="anonymous"`;

  console.log("Navigating to /builder with final prompt:", finalPrompt);

  // Record usage on successful submission
  recordUsageNow();

  navigate('/builder', {
    state: {
      prompt: finalPrompt
    }
  });
};

  // Clerk handles auth; no local auth modal required

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 flex flex-col">
      <ToastContainer />
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 shadow-lg rounded-b-2xl">
        <div className="flex items-center gap-3">
          <FaMagic className="text-3xl text-pink-300 drop-shadow-lg animate-pulse" />
          <span className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            Buildify <FaCogs className="inline text-indigo-300 animate-spin-slow" />
          </span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white font-bold shadow hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-pink-300">
                Login / Register
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
      {/* Clerk handles auth modals; custom modal removed */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Wand2 className="w-14 h-14 text-pink-400 drop-shadow animate-pulse" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-4 tracking-wide drop-shadow">
              Buildify
            </h1>
            <p className="text-lg text-blue-200 font-medium">
              Describe your dream website, and we'll help you build it step by step
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl p-8 border border-blue-700">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build..."
                className="w-full h-32 p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-purple-900 text-white border-2 border-purple-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 shadow-lg transition-all duration-200 resize-none rounded-xl placeholder:text-purple-300"
              />

              {/* Cloudinary URL Management and Image Upload */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-200 font-semibold">Cloudinary URL:</span>
                  {cloudinaryUrl ? (
                    <span className="truncate text-pink-200 bg-gray-800 px-2 py-1 rounded-lg border border-purple-500 max-w-[180px] overflow-hidden">{cloudinaryUrl}</span>
                  ) : (
                    <span className="text-pink-400 italic">Not set</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCloudinaryUrlInput(cloudinaryUrl || '');
                      setCloudinaryPresetInput(cloudinaryPreset || '');
                      setShowCloudinaryModal(true);
                    }}
                    className="ml-2 px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white font-bold shadow hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    {cloudinaryUrl ? 'Edit' : 'Set'}
                  </button>
                </div>
                <div>
                  <label className="block text-blue-200 mb-1 font-semibold">
                    Upload Custom Images (you can upload multiple):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full bg-gray-900 text-white p-2 border-2 border-purple-500 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder:text-purple-300 disabled:opacity-50"
                    disabled={!cloudinaryUrl}
                  />
                  {!cloudinaryUrl && (
                    <div className="text-pink-400 text-xs mt-1">Set your Cloudinary URL to enable image upload.</div>
                  )}
                </div>
              </div>

              {/* Cloudinary URL Modal */}
              {showCloudinaryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl border border-blue-700 p-6 w-full max-w-md">
                    <h3 className="text-xl font-extrabold tracking-wide text-white mb-4">Set Cloudinary Upload URL & Preset</h3>
                    <div className="flex flex-col gap-4">
                      <input
                        type="text"
                        placeholder="Enter your Cloudinary upload URL..."
                        value={cloudinaryUrlInput}
                        onChange={e => setCloudinaryUrlInput(e.target.value)}
                        className="p-2 rounded-lg border-2 border-purple-500 bg-gray-800 text-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder:text-purple-300"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Enter your Cloudinary upload preset..."
                        value={cloudinaryPresetInput}
                        onChange={e => setCloudinaryPresetInput(e.target.value)}
                        className="p-2 rounded-lg border-2 border-purple-500 bg-gray-800 text-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder:text-purple-300"
                        required
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => setShowCloudinaryModal(false)}
                          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 border border-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCloudinaryUrl(cloudinaryUrlInput);
                            setCloudinaryPreset(cloudinaryPresetInput);
                            setShowCloudinaryModal(false);
                            console.log('Cloudinary URL set to:', cloudinaryUrlInput);
                            console.log('Cloudinary Preset set to:', cloudinaryPresetInput);
                          }}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white font-bold shadow-lg hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Descriptions for each image */}
              {images.map((img, index) => (
                <div key={index} className="mt-4 space-y-2 relative bg-black/10 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-pink-200 text-sm font-mono">Image {index + 1}: {img.file.name}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="ml-2 px-2 py-1 rounded bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow hover:from-pink-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter description (e.g., Hero Section)"
                    value={img.description}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    className="w-full bg-gradient-to-br from-gray-800 via-gray-900 to-purple-900 text-white p-2 border-2 border-purple-500 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder:text-purple-300"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={uploading}
                className="w-full mt-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50"
              >
                {uploading ? 'Uploading Images...' : 'Generate Website Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
