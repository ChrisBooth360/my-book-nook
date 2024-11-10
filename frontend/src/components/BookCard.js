import React, { useState } from 'react';
import placeholderCover from '../assets/book-nook-placeholder.png';
import BookCardButtons from './BookCardButtons';
import { removeBookFromShelf } from '../services/api';

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
      <img 
        src={normalizedBook.volumeInfo.imageLinks.thumbnail || placeholderCover} 
        alt="Book cover" 
        onClick={handleToggleExpand} 
      />

      {/* Book Details */}
      <div className="book-details">
        <h3 onClick={handleToggleExpand}>{normalizedBook.volumeInfo.title}</h3>
        <p>by {normalizedBook.volumeInfo.authors?.join(', ')}</p>
        
        {/* Expanded Book Information */}
        {isExpanded && (
          <div className="expanded-book-info">
            <p><strong>Description:</strong> {normalizedBook.volumeInfo.description}</p>
            <p><strong>Page Count:</strong> {normalizedBook.volumeInfo.pageCount}</p>
            <p><strong>Publish Year:</strong> {normalizedBook.volumeInfo.publishedDate}</p>
            <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
            <p><strong>Status:</strong> {normalizedBook.status}</p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {statusMessage[normalizedBook.googleBookId] && (
        <p className="status-message">{statusMessage[normalizedBook.googleBookId]}</p>
      )}

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
  );
};

export default BookCard;
