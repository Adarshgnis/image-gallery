import React, { useEffect, useState } from 'react';
import Skeleton from './Skeleton';
import Modal from './Modal';
import InfiniteScroll from 'react-infinite-scroll-component';
import config from './config';


const API_KEY = config.API_KEY;
const MAX_SEARCH_HISTORY = 5;


const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [savedSearchQueries, setSavedSearchQueries] = useState([]);


  useEffect(() => {
    if (searchTerm.trim() !== '') {
      searchPhotos();
    } else {
      fetchDefaultPhotos();
    }
  }, [searchTerm]);

  useEffect(() => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        const updatedQueries = [searchTerm, ...savedSearchQueries.slice(0, MAX_SEARCH_HISTORY - 1)];
        setSavedSearchQueries(updatedQueries);
        localStorage.setItem('savedSearchQueries', JSON.stringify(updatedQueries));
      }
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);



  const fetchDefaultPhotos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${API_KEY}&format=json&nojsoncallback=1&safe_search=1&text=dummy`
      );
      const data = await response.json();

      if (data && data.photos && Array.isArray(data.photos.photo)) {
        const fetchedPhotos = data.photos.photo;
        setPhotos(fetchedPhotos);
      } else {
        console.error('Invalid response format:', data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching default photos:', error);
      setIsLoading(false);
    }
  };




  const searchPhotos = async () => {
    try {
      setIsLoading(true);
      const encodedQuery = encodeURIComponent(searchTerm);
      const response = await fetch(
        `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&safe_search=1&text=${encodedQuery}&per_page=50&sort=relevance`
      );
      const data = await response.json();
      const fetchedPhotos = data.photos.photo;
      setPhotos(fetchedPhotos);
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching photos:', error);
      setIsLoading(false);
    }
  };

  let timeoutId; 

  const handleSearch = (event) => {
    const searchQuery = event.target.value;
    setSearchTerm(searchQuery);
  };

  const selectSearchQuery = (query) => {
    setSearchTerm(query);
  };

  const clearSearchHistory = () => {
    setSavedSearchQueries([]);
    localStorage.removeItem('savedSearchQueries');
  };

  const handleImageLoad = (photoId) => {
    setLoadedImages((prevLoadedImages) => [...prevLoadedImages, photoId]);
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const fetchMorePhotos = async () => {
    try {
      const response = await fetch(
        `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&safe_search=1&text=${searchTerm}&sort=relevance&per_page=50&page=${Math.ceil(
          photos.length / 50
        ) + 1}`
      );
      const data = await response.json();
      if (data && data.photos && Array.isArray(data.photos.photo)) {
        const fetchedPhotos = data.photos.photo;
        if (fetchedPhotos.length === 0) {
          setHasMore(false);
        } else {
          setPhotos((prevPhotos) => [...prevPhotos, ...fetchedPhotos]);
        }
      } else {
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error fetching more photos:', error);
    }
    setIsLoading(false);
  };


  return (
    <div>
      <header className='bg-gray-900 flex items-center py-5 sticky top-0'>
        <div className='w-full max-w-md mx-auto'>
          <h1 className='text-white text-center text-2xl font-bold mb-5'>Image Gallery</h1>
          <input
            type='search'
            className='bg-gray-50 border border-gray-300 text-sm w-full indent-2 p-2.5 outline-none focus:border-blue-500 focus:ring-2 rounded'
            value={searchTerm}
            placeholder='Search photos'
            onChange={handleSearch}
          />
          <ul className='flex flex-wrap '>
            {savedSearchQueries.map((query, index) => (
              <li
                key={index}
                onClick={() => selectSearchQuery(query)}
                style={{ cursor: 'pointer' }}
                className='bg-gray-50 hover:bg-slate-200 rounded px-2 mt-2 mx-1.5'
              >
                {query}
              </li>
            ))}
          </ul>
          <button onClick={clearSearchHistory} className='text-red-500 px-2 mt-2 hover:text-red-600'>Clear Search History</button>
        </div>
      </header>
      <main>
        <InfiniteScroll
          dataLength={photos.length}
          next={fetchMorePhotos}
          hasMore={hasMore}
        >
          <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-10 max-w-7xl mx-auto px-4'>
            {isLoading ? (
              <Skeleton item={20} />
            ) : (
              photos.map((photo, index) => (
                <div key={`${photo.id}-${index}`}>
                  {!loadedImages.includes(photo.id) && <Skeleton />}
                  <img
                    className={`h-72 w-full object-cover rounded-lg shadow-md cursor-pointer ${loadedImages.includes(photo.id) ? '' : 'hidden'
                      }`}
                    src={`https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`}
                    alt={photo.title}
                    onClick={() => openModal(photo)}
                    onLoad={() => handleImageLoad(photo.id)}
                  />
                </div>
              ))
            )}


          </div>
        </InfiniteScroll>
      </main>
      {selectedPhoto && <Modal photo={selectedPhoto} closeModal={closeModal} />}
    </div>
  );
};

export default Home;
