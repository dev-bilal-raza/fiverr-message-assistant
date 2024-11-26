import fiverr from '@/assets/fiverr-logo.png'
import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  const [displayApiKey, setDisplayApiKey] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const loadAPIKey = async () => {
      try {
        if (!chrome?.storage?.local) return
        
        const stored = await chrome.storage.local.get('apiKey')
        if (stored.apiKey) {
          // Mask the API key
          const maskedKey = `${stored.apiKey.substring(0, 6)}...${stored.apiKey.slice(-4)}`
          setDisplayApiKey(maskedKey)
          setApiKey(stored.apiKey)
        }
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load API key', error)
        setIsLoaded(true)
      }
    }

    loadAPIKey()
  }, [])

  const handleAddAPIKey = async () => {
    if (!apiKey.trim()) {
      setSaveStatus('error')
      return
    }

    try {
      await chrome.storage.local.set({ apiKey })
      
      // Mask the API key after saving
      const maskedKey = `${apiKey.substring(0, 6)}...${apiKey.slice(-4)}`
      setDisplayApiKey(maskedKey)
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to save API key', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey)
  }

  return (
    <div className="relative w-[350px] bg-gradient-to-br from-[#003912] to-[#005c1a] p-6 text-white min-h-[500px] flex flex-col">
      {isLoaded && (
        <div className="flex-grow flex flex-col">
          <div className="w-full h-24 overflow-hidden mb-4">
            <img
              className="mx-auto h-24 w-auto object-contain"
              src={fiverr}
              alt="Fiverr Logo"
            />
          </div>
          
          <div className="text-center mb-6">
            <h1 className="font-bold text-3xl mb-2">
              Fiverr <span className="text-[#1dbf73]">AI Message</span> Assistant
            </h1>
            <p className="text-base text-slate-300">
              Your AI-Powered Messaging Companion
            </p>
          </div>
          
          <div className="flex-grow">
            <div className="space-y-4">
              <label htmlFor="apiKey" className="block text-white font-bold text-lg">
                Enter Your OpenAI API Key
              </label>
              
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-12 bg-white/10 text-white placeholder-gray-400 border-gray-600"
                />
                <button 
                  onClick={toggleApiKeyVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {displayApiKey && (
                <div className="text-sm text-gray-300 mt-2">
                  Saved Key: <span className="font-mono">{displayApiKey}</span>
                </div>
              )}

              <Button 
                onClick={handleAddAPIKey} 
                className="w-full bg-[#1dbf73] hover:bg-[#17a760] text-white"
              >
                Save API Key
              </Button>

              {saveStatus === 'success' && (
                <div className="flex items-center text-green-400 mt-2">
                  <CheckCircle2 className="mr-2" />
                  API Key saved successfully
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center text-red-400 mt-2">
                  <AlertCircle className="mr-2" />
                  Failed to save API Key
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-300">
              Need help?{' '}
              <a
                href="https://github.com/your-github-repo/fiverr-message-assistant"
                className="text-[#1dbf73] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Check out our GitHub
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Popup