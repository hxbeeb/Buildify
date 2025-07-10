
import { X } from 'lucide-react';
import { FileViewerProps } from '../types';

export function FileViewer({ file, onClose }: FileViewerProps) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl border border-blue-700">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 border-b border-blue-800 rounded-t-2xl">
          <h3 className="text-lg font-extrabold tracking-wide text-white drop-shadow flex-1 truncate">{file.path}</h3>
          <button
            onClick={onClose}
            className="ml-4 flex items-center justify-center text-pink-200 hover:text-white bg-pink-500/10 hover:bg-pink-500/30 rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)] bg-black/30">
          <pre className="text-sm text-pink-100 font-mono whitespace-pre-wrap">
            {file.content || 'No content available'}
          </pre>
        </div>
      </div>
    </div>
  );
}