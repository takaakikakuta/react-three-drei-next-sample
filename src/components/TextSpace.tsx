import React, { useEffect, useRef, useState } from 'react'
import { data } from './data'; // データファイルをインポート
import { useControl } from './hooks/PointOverContext';

interface TextSpaceProps {
  currentAudioIndex: number;
  isPlaying:boolean;
}

const textFiles = data.textFiles

const TextSpace: React.FC<TextSpaceProps>= ({currentAudioIndex, isPlaying}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const [textContent, setTextContent] = useState<string>('');
    const { isPointerOver, setIsPointerOver } = useControl();
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const content = contentRef.current;

        if (content) {
          if (isCollapsed) {
            content.style.maxHeight = '0px';
          } else {
            content.style.maxHeight = `${content.scrollHeight}px`;
          }
        }
      }, [isCollapsed, textContent]);

      useEffect(() => {
        const loadTextContent = async () => {
          try {
            const response = await fetch(textFiles[currentAudioIndex]);
            const text = await response.text();
            setTextContent(text);
          } catch (error) {
            console.error('Error loading text file:', error);
            setTextContent('Error loading content');
          }
        };

        if(isPlaying){
          setIsCollapsed(false)
        }
    
        loadTextContent();
      }, [currentAudioIndex, isPlaying]);

    const toggleCollapse = () => {
      setIsCollapsed((prev) => !prev);
    };

  return (
    <div 
      className='absolute bottom-0 z-40 max-h-[50vh] bg-blue-600 bg-opacity-75 py-2 px-4 md:py-4 md:pb-6 md:px-6'
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={() => setIsPointerOver(false)}
    >
        <div className="flex w-full justify-end px-3">
            <button className="flex rounded-full text-black" onClick={toggleCollapse} onTouchStart={toggleCollapse}>
                {isCollapsed ? '+' : '-'}
            </button>
        </div>
        <div
          ref={contentRef}
          className={`transition-max-height duration-500 ease-in-out w-full overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-screen'}`}
          style={{ maxHeight: isCollapsed ? '0px' : 'none' }}>
          <p className='text-2xl md:text-4xl shadow-text-outline text-white'>{textContent}</p>
        </div>
    </div>
  )
}

export default TextSpace
