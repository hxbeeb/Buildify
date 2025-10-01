import  { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/previewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';
import { FaMagic, FaPaperPlane, FaCogs, FaCode, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../AuthProvider';



export function Builder() {

  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  // Read prompt from location.state or localStorage for reload safety
  const prompt = location.state?.prompt || localStorage.getItem('builderPrompt');

  // All hooks at the top
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showFileExplorer, setShowFileExplorer] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // If prompt is missing on initial load (e.g., after reload), navigate to home
  useEffect(() => {
    if (!prompt) {
      navigate('/', { replace: true });
    }
  }, [prompt, navigate]);

  useEffect(() => {
    if (prompt) {
      localStorage.setItem('builderPrompt', prompt);
    }
  }, [prompt]);

  // Prevent accidental reload or navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Switch to preview tab only once after initial build completes
  const hasAutoSwitchedRef = useRef(false);
  useEffect(() => {
    if (templateSet && !loading && !hasAutoSwitchedRef.current) {
      hasAutoSwitchedRef.current = true;
      setActiveTab('preview');
    }
  }, [templateSet, loading]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
          if (!parsedPath.length) {
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    })
    if (updateHappened) {
      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => ({
        ...s,
        status: "completed"
      })))
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)]))
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
        return mountStructure[file.name];
      };
      files.forEach(file => processFile(file, true));
      return mountStructure;
    };
    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  const initRanRef = useRef(false);

  async function init() {
    if (!prompt) return;
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    
    const {prompts, uiPrompts} = response.data;  // Extract projectCode

    // setProjectCode(projectCode);  // Set the projectCode to state

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);
    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
  }

  // Start build automatically when prompt and auth are ready (works on reload)
  useEffect(() => {
    if (!initRanRef.current && !authLoading && user && prompt) {
      initRanRef.current = true;
      init();
    }
  }, [authLoading, user, prompt]);

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 flex flex-col overflow-hidden">
      <header className="bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 shadow-lg border-b border-gray-700 px-6 py-4 flex items-center gap-3 rounded-b-2xl">
        <FaMagic className="text-3xl text-pink-300 drop-shadow-lg animate-pulse" />
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-2">
            Buildify <FaCogs className="inline text-indigo-300 animate-spin-slow" />
          </h1>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col h-0 min-h-0">
        {/* Show/Hide Code button above the editor area */}
        <div className="w-full flex items-center justify-end mb-2 px-2 md:px-6 shrink-0">
          {showFileExplorer ? (
            <button
              onClick={() => setShowFileExplorer(false)}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-700 via-purple-700 to-pink-700 hover:from-gray-600 hover:to-pink-600 text-white font-bold py-1 px-4 rounded-xl shadow-md transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <FaEyeSlash className="text-base" /> Hide Code
            </button>
          ) : (
            <button
              onClick={() => setShowFileExplorer(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:to-pink-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-300 animate-pulse hover:animate-none"
            >
              <FaCode className="text-lg" /> Show Code
            </button>
          )}
        </div>
        <div className={`grid gap-4 md:gap-6 p-2 md:p-6 grid-cols-1 md:grid-cols-12 h-full min-h-0`}>
          <div className="col-span-1 md:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-auto bg-white/5 rounded-2xl shadow-lg p-2 backdrop-blur-md border border-purple-700">
              <StepsList
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>
            <div className="shrink-0 mt-4">
              <div className='flex flex-col gap-2'>
                {(loading || !templateSet) && <div className="flex justify-center items-center py-4"><Loader /></div>}
                {!(loading || !templateSet) && <div className='flex flex-col gap-2'>
                  <textarea value={userPrompt} onChange={(e) => {
                  setPrompt(e.target.value)
                }} className='p-3 w-full rounded-xl bg-gradient-to-br from-gray-800 via-gray-900 to-purple-900 text-white border-2 border-purple-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 shadow-lg transition-all duration-200 resize-none placeholder:text-purple-300' placeholder="Type your next instruction..." rows={3}></textarea>
         
                  <button onClick={async () => {
                    const newMessage = {
                      role: "user" as "user",
                      content: userPrompt
                    };

                    const messagesToSend = [...llmMessages, newMessage];

                    console.log("Sending messages to backend:", messagesToSend);

                    setLoading(true);

                    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                      messages: messagesToSend
                    });

                    setLoading(false);

                     setLlmMessages(x => [...x, newMessage]);
                     setLlmMessages(x => [...x, {
                       role: "assistant",
                       content: stepsResponse.data.response
                        }]);

                        setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                          ...x,
                          status: "pending" as "pending"
                        }))]);

                      }} className='flex items-center gap-2 justify-center bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500 text-white font-bold py-2 px-6 rounded-xl shadow-xl shadow-pink-400/40 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:ring-opacity-60 animate-pulse hover:animate-none'>
                    <FaPaperPlane className="text-lg" /> Send
                  </button>
                </div>}
              </div>
            </div>
          </div>
           {/* File Explorer column, only when shown */}
           {showFileExplorer && (
            <div className="col-span-1 md:col-span-3 flex flex-col h-full min-h-0">
              <div className="bg-white/5 rounded-2xl shadow-lg p-2 backdrop-blur-md border border-blue-700 flex-1 min-h-0 overflow-auto">
                 <FileExplorer 
                   files={files} 
                   onFileSelect={setSelectedFile}
                   // projectCode={projectCode}  // Pass projectCode to FileExplorer
                 />
               </div>
             </div>
           )}
          <div className={`bg-white/10 rounded-3xl shadow-2xl p-4 flex flex-col h-full min-h-0 border border-indigo-700 backdrop-blur-md mt-4 md:mt-0 ${showFileExplorer ? 'col-span-1 md:col-span-6' : 'col-span-1 md:col-span-9'}`}>
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 min-h-0 h-0 overflow-auto">
              <div style={{ display: activeTab === 'code' ? 'block' : 'none', height: '100%' }}>
                <CodeEditor file={selectedFile} />
              </div>
              <div style={{ display: activeTab === 'preview' ? 'block' : 'none', height: '100%' }}>
                <PreviewFrame webContainer={webcontainer!} files={files} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
