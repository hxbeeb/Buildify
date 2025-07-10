import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FolderTree, File, ChevronRight, ChevronDown, Download, Github } from 'lucide-react';
import { FileItem } from '../types';
import { Octokit } from '@octokit/rest';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
}

function FileNode({ item, depth, onFileClick }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={handleClick}
      >
        {item.type === 'folder' && (
          <span className="text-gray-400">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {item.type === 'folder' ? (
          <FolderTree className="w-4 h-4 text-blue-400" />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-gray-200">{item.name}</span>
      </div>
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [showModal, setShowModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [repoName, setRepoName] = useState('');

  const downloadFiles = async () => {
    const zip = new JSZip();

    const addFilesToZip = (fileList: FileItem[], folder?: JSZip) => {
      fileList.forEach((file) => {
        if (file.type === 'folder') {
          const subFolder = folder ? folder.folder(file.name) : zip.folder(file.name);
          if (file.children) {
            addFilesToZip(file.children, subFolder!);
          }
        } else {
          const content = file.content || '';
          if (folder) {
            folder.file(file.name, content);
          } else {
            zip.file(file.name, content);
          }
        }
      });
    };

    addFilesToZip(files);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'website_files.zip');
  };

  const pushToGitHub = async (token: string, username: string, repo: string) => {
    if (!token || !username || !repo) {
      alert('Please provide all required fields.');
      return;
    }

    const octokit = new Octokit({
      auth: token,
    });

    try {
      // Create repo if it doesn't exist
      await octokit.repos.createForAuthenticatedUser({
        name: repo,
        private: false,
      });
    } catch (e) {
      // Repo may already exist, ignore error
    }

    try {
      const commitMessage = 'Initial commit';
      const branch = 'main';

      const addFilesToGitHub = async (fileList: FileItem[], parentPath: string = '') => {
        for (const file of fileList) {
          if (file.type === 'folder') {
            await addFilesToGitHub(file.children || [], `${parentPath}${file.name}/`);
          } else {
            const content = file.content || '';
            let filePath = `${parentPath}${file.name}`;

            if (filePath.startsWith('/')) {
              filePath = filePath.substring(1);
            }

            const base64Content = btoa(unescape(encodeURIComponent(content)));

            await octokit.repos.createOrUpdateFileContents({
              owner: username,
              repo,
              path: filePath,
              message: commitMessage,
              content: base64Content,
              branch,
            });
          }
        }
      };

      await addFilesToGitHub(files);

      alert('Code pushed to GitHub successfully!');
    } catch (error: unknown) {
      console.error('Error pushing code to GitHub:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl p-4 h-full overflow-auto border border-blue-700 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-blue-900">
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          border-radius: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1e293b;
        }
      `}</style>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-extrabold tracking-wide text-white drop-shadow">File Explorer</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadFiles}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <Download className="w-4 h-4" /> Get Code
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-green-300 hover:via-blue-400 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <Github className="w-4 h-4" /> Push to GitHub
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {files.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={onFileSelect}
          />
        ))}
      </div>
      {/* Modal for GitHub credentials */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl border border-blue-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-extrabold tracking-wide text-white mb-4">Push to GitHub</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setShowModal(false);
                await pushToGitHub(githubToken, githubUsername, repoName);
                setGithubToken('');
                setGithubUsername('');
                setRepoName('');
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="GitHub Secret Token"
                value={githubToken}
                onChange={e => setGithubToken(e.target.value)}
                className="p-2 rounded-lg border-2 border-purple-500 bg-gray-800 text-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder:text-purple-300"
                required
              />
              <input
                type="text"
                placeholder="GitHub Username"
                value={githubUsername}
                onChange={e => setGithubUsername(e.target.value)}
                className="p-2 rounded-lg border-2 border-purple-500 bg-gray-800 text-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder:text-purple-300"
                required
              />
              <input
                type="text"
                placeholder="Repository Name"
                value={repoName}
                onChange={e => setRepoName(e.target.value)}
                className="p-2 rounded-lg border-2 border-purple-500 bg-gray-800 text-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder:text-purple-300"
                required
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 border border-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white font-bold shadow-lg hover:from-green-300 hover:via-blue-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  Push
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
