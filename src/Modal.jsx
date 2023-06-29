import React from 'react';

const Modal = ({ photo, closeModal }) => {
  return (
    <div className='fixed inset-0 flex items-center justify-center z-10'>
      <div className='fixed inset-0 bg-black opacity-75'></div>
      <div className='fixed flex items-center justify-center w-full h-full'>
        <div className='bg-white max-w-3xl mx-auto p-4 rounded-lg'>
          <img
            className='h-96 w-full object-cover rounded-lg shadow-md'
            src={`https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`}
            alt={photo.title}
          />
          <button
            className='mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
