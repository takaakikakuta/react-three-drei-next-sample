import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Pagination } from 'swiper/modules';
import { useControl } from './hooks/PointOverContext';
import { data } from './data'; // データファイルをインポート

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSlide:number
    onSelectSlide: (index: number) => void;
  }

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onSelectSlide,selectedSlide }) => {
  const { isPointerOver, setIsPointerOver } = useControl();
  if (!isOpen) return null;
  const videos = data.videos

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      onClose();
      setIsPointerOver(false)
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    onClose();
    setIsPointerOver(false);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={() => setIsPointerOver(false)} 
    >
    <div className="bg-white rounded-lg p-2 md:p-6 w-4/5 md:w-1/2 " onClick={(e) => e.stopPropagation()}>
      <h2 className="text-xl font-bold mb-4">Camera Settings</h2>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={50}
        slidesPerView={1}
        initialSlide={selectedSlide}
        onSlideChange={(swiper) => onSelectSlide(swiper.activeIndex)}
      >
        <SwiperSlide>
          <video src={videos[0]}></video>
        </SwiperSlide>
        <SwiperSlide>
          <video src={videos[1]}></video>
        </SwiperSlide>
        <SwiperSlide>
          <video src={videos[2]}></video>
        </SwiperSlide>
        {/* 他のスライド */}
      </Swiper>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleButtonClick}
      >
        Close
      </button>
    </div>
  </div>
  )
}

export default CameraModal
