// src/components/BookCard.js
import React, { useState } from 'react';
import placeholderCover from '../assets/book-nook-placeholder.png';
import BookCardButtons from './BookCardButtons';
import { removeBookFromShelf } from '../services/api';
import DOMPurify from 'dompurify';

const normalizeBookData = (book) => {
  const defaultImageLinks = { thumbnail: '' };
  if (!book.volumeInfo) {
    return {
      volumeInfo: {
        title: book.title || 'No title available',
        authors: book.authors ? [book.authors] : [],
        publisher: book.publisher || 'Unknown Publisher',
        publishedDate: book.publishedDate || 'Unknown Date',
        description: book.description || 'No description available',
        pageCount: book.pageCount || 0,
        categories: book.categories ? [book.categories] : [],
        imageLinks: book.thumbnail ? { thumbnail: book.thumbnail } : defaultImageLinks,
        language: book.language || 'Unknown Language',
        previewLink: book.previewLink || '#',
        infoLink: book.infoLink || '#',
      },
      saleInfo: {
        buyLink: book.buyLink || '#',
      },
      status: book.status || 'unread',
      existsInLibrary: true,
      googleBookId: book.googleBookId,
    };
  } else {
    return {
      ...book,
      volumeInfo: {
        ...book.volumeInfo,
        imageLinks: book.volumeInfo.imageLinks || defaultImageLinks,
      },
    };
  }
};

const BookCard = ({
  book,
  setUserLibraryBooks,
  setBooks,
  statusMessage,
  setStatusMessage,
}) => {
  const normalizedBook = normalizeBookData(book);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleRemoveFromLibrary = async () => {
    const token = localStorage.getItem('token');
    try {
      await removeBookFromShelf(token, normalizedBook.googleBookId);
      setBooks((prevBooks) => prevBooks.filter((b) => b.googleBookId !== normalizedBook.googleBookId));
      setStatusMessage((prev) => ({
        ...prev,
        [normalizedBook.googleBookId]: 'Book removed from library',
      }));
    } catch (error) {
      console.error('Error removing book from library:', error.message);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <div className={`book-card ${normalizedBook.status === 'currently reading' ? 'currently-reading' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {/* Book Thumbnail */}
      <div>
        <img 
          src={normalizedBook.volumeInfo.imageLinks.thumbnail || placeholderCover} 
          alt="Book cover" 
          onClick={handleToggleExpand} 
        />
      </div>
      
      {/* Book Details */}

<div className="book-details">
  <div className="book-header">
    <h3 onClick={handleToggleExpand}>{normalizedBook.volumeInfo.title}</h3>
    <p>by {normalizedBook.volumeInfo.authors?.join(', ')}</p>
  </div>
  
  <div className="details-wrapper">
    {/* Expanded Book Information */}
    {isExpanded && (
      <div className="expanded-book-info">
        <div className="small-expanded-book-info">
          <p><strong>ISBN: </strong> {book.isbn || 'N/A'}</p>
          <p><strong>Publisher: </strong> {normalizedBook.volumeInfo.publisher}</p>
          <p><strong>Published: </strong> {normalizedBook.volumeInfo.publishedDate}</p>
          <p><strong>Page Count: </strong> {normalizedBook.volumeInfo.pageCount}</p>
        </div>
        <p>
          <strong>Description: </strong>
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(normalizedBook.volumeInfo.description || 'No description available.'),
            }}
          ></span>
        </p>
      </div>
    )}
    {/* More/Less Details Toggle */}
    <div className="details-toggle">
      <p onClick={handleToggleExpand}>
        {isExpanded ? 'less details' : 'more details'}
      </p>
    </div>
  </div>
</div>


      <div className="button-section">
        {/* Status Message */}
        <p className="status-message">
          {statusMessage[normalizedBook.googleBookId] || '\u00A0'}
        </p>

        {/* Book Card Buttons and Remove Button */}
        <div className="book-card-buttons">
          <BookCardButtons
            normalizedBook={normalizedBook}
            setUserLibraryBooks={setUserLibraryBooks}
            setBooks={setBooks}
            setStatusMessage={setStatusMessage}
          />

          {/* Remove from Library Button */}
          {normalizedBook.existsInLibrary && (
            <button className="btn remove-from-library-btn" onClick={handleRemoveFromLibrary}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
