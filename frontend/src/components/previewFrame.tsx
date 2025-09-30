import { WebContainer } from '@webcontainer/api';
import  { useEffect, useRef, useState } from 'react';

interface PreviewFrameProps {
  files: any[]; // Replace `any[]` with the appropriate type for files
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [isFilesLoaded, setIsFilesLoaded] = useState(false);
  const [loading, setLoading] = useState(true); // Manage loading state
  const installingMissingRef = useRef<Set<string>>(new Set());
  const startedRef = useRef(false);

  // Function to write files to the WebContainer
  const writeFilesToContainer = async () => {
    try {
      for (const file of files) {
        const { path, content } = file;
        if (content) {
          console.log(`Writing file: ${path}`);
          await webContainer.fs.writeFile(path, content);
        }
      }
      setIsFilesLoaded(true); // Mark as loaded after all files are written
    } catch (error) {
      console.error("Error writing files:", error);
      setLoading(false); // If there's an error, stop loading
    }
  };

  // Run build commands (npm install and npm run dev) after files are loaded (only once)
  const runBuildCommands = async () => {
    try {
      setLoading(true); // Start loading during the build process

      const installProcess = await webContainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("npm install output:", data);
          },
        })
      );

      // Wait for the install process to complete
      await installProcess.exit;

      const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const text = String(data || '');
            console.log("npm run dev output:", text);
            // Auto-install missing bare module imports detected by Vite or Node
            const m1 = text.match(/Failed to resolve import\s+\"([^\"]+)\"/);
            const m2 = text.match(/Cannot find module ['\"]([^'\"]+)['\"]/);
            const missing = (m1 && m1[1]) || (m2 && m2[1]);
            if (missing && !missing.startsWith('.') && !missing.startsWith('/')) {
              if (!installingMissingRef.current.has(missing)) {
                installingMissingRef.current.add(missing);
                (async () => {
                  try {
                    setLoading(true);
                    const addProc = await webContainer.spawn('npm', ['add', missing]);
                    await addProc.exit;
                  } catch (e) {
                    console.error('Failed to add missing module', missing, e);
                  } finally {
                    setLoading(false);
                  }
                })();
              }
            }
          },
        })
      );

      // Listen for the server-ready event
      webContainer.on('server-ready', (port, url) => {
        console.log(`Server is ready at port: ${port}, URL: ${url}`);
        setUrl(url); // Set the URL for the iframe
        setLoading(false); // Stop loading once the server is ready
      });
    } catch (error) {
      console.error("Error in WebContainer setup:", error);
      setLoading(false); // Stop loading if there's an error in the build process
    }
  };


 
  
  // Effect hook to write files to the container
  useEffect(() => {
    if (webContainer && files.length > 0) {
      (async () => {
        await writeFilesToContainer();
      })();
    }
  }, [webContainer, files]);

  // Effect hook to run build commands after files are loaded (guarded)
  useEffect(() => {
    if (isFilesLoaded && !startedRef.current) {
      startedRef.current = true;
      (async () => {
        await runBuildCommands();
      })();
    }
  }, [isFilesLoaded]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {loading && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {!loading && url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}
