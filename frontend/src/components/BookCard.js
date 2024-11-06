// src/components/BookCard.js
import React from 'react';
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

  const handleRemoveFromLibrary = async () => {
    const token = localStorage.getItem('token');
    try {
      await removeBookFromShelf(token, normalizedBook.googleBookId);
      setUserLibraryBooks((prev) =>
        prev.filter((b) => b.googleBookId !== normalizedBook.googleBookId)
      );
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.googleBookId === normalizedBook.googleBookId
            ? { ...b, existsInLibrary: false, status: null }
            : b
        )
      );
      setStatusMessage((prev) => ({
        ...prev,
        [normalizedBook.googleBookId]: 'Book removed from library',
      }));
    } catch (error) {
      console.error('Error removing book from library:', error.message);
    }
  };

  return (
    <div className={`book-card ${normalizedBook.status === 'currently reading' ? 'currently-reading' : ''}`}>
      <img 
        src={normalizedBook.volumeInfo.imageLinks.thumbnail || placeholderCover} 
        alt="Book cover" 
      />
      <div className="book-details">
        <h3>{normalizedBook.volumeInfo.title}</h3>
        <p>by {normalizedBook.volumeInfo.authors?.join(', ')}</p>
      </div>

      {statusMessage[normalizedBook.googleBookId] && (
        <p className="status-message">{statusMessage[normalizedBook.googleBookId]}</p>
      )}
      <div className="book-card-buttons">
        <BookCardButtons
          normalizedBook={normalizedBook}
          setUserLibraryBooks={setUserLibraryBooks}
          setBooks={setBooks}
          setStatusMessage={setStatusMessage}
        />

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
