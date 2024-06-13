import React from 'react'
import { useControl } from './hooks/PointOverContext';

interface CameraModalProps {
    isClick: boolean;
    onClose: () => void;
    productName:string;
  }

const products = [
    {
      name:"OBJ-EWHRT",
      image:"./Linear/productPicture/EWHRT.png",
      link:"https://official.koganei.co.jp/product/EWHRT"
    },
    {
      name:"OBJ_NHBDPG-40",
      image:"./Linear/productPicture/NHBDPG-40.png",
      link:"https://official.koganei.co.jp/product/NHBDPG"
    },
]

const ProductModal: React.FC<CameraModalProps>  = ({isClick, onClose, productName}) => {
  const { isPointerOver, setIsPointerOver } = useControl();
    if (!isClick) return null;

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

    const product = products.find((product) => product.name === productName);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={() => setIsPointerOver(false)} 
    >
    <div className="bg-white rounded-lg p-2 md:p-6 w-4/5 md:w-1/2 ">

        <div className="flex justify-end">
          <button className='font-bold text-xl' onClick={handleButtonClick}>×</button>
        </div>

        {product && (
          <>
            <div className="text-center font-bold text-lg mb-4">{product.name}</div>
            <div className="flex justify-center">
              <img className="w-1/2" src={product.image} alt={product.name} />
            </div>
            <div className="flex justify-center mt-4">
              <a className="text-blue-500" href={product.link} target="_blank" rel="noopener noreferrer">
                詳細はこちら（メーカーホームページにとびます）
              </a>
            </div>
          </>
        )}

    </div>
  </div>
  )
}

export default ProductModal
