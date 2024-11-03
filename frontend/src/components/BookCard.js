// components/BookCard.js
import React, { useRef } from 'react';
import placeholderCover from '../assets/book-nook-placeholder.png';
import { updateBookStatus, addBookToShelf } from '../services/api';

const normalizeBookData = (book) => {
  if (!book.volumeInfo) {
    return {
      thumbnail: book.thumbnail || placeholderCover,
      volumeInfo: {
        title: book.title || 'No title available',
        authors: book.author ? [book.author] : [],
      },
      status: book.status,
      existsInLibrary: true,
      googleBookId: book.googleBookId,
    };
  } else {
    return book;
  }
};

const BookCard = ({
  book,
  onAddToShelf,
  userLibraryBooks,
  setUserLibraryBooks,
  setBooks,
  dropdownVisible,
  toggleDropdown,
  statusMessage,
  setStatusMessage,
}) => {
  const dropdownRef = useRef(null);
  const normalizedBook = normalizeBookData(book);

  const handleStatusChange = async (book, status) => {
    const token = localStorage.getItem('token');

    try {
      if (book.existsInLibrary) {
        await updateBookStatus(token, book.googleBookId, status);
      } else {
        await addBookToShelf(token, book.googleBookId, status);
      }

      setUserLibraryBooks((prev) => [
        ...prev.filter((b) => b.googleBookId !== book.googleBookId),
        { googleBookId: book.googleBookId, status },
      ]);

      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.googleBookId === book.googleBookId
            ? { ...b, status, existsInLibrary: true }
            : b
        )
      );

      setStatusMessage((prev) => ({
        ...prev,
        [book.googleBookId]: `Status changed to ${status}`,
      }));
    } catch (error) {
      console.error('Error updating book status:', error.message);
    }
  };

  return (
    <div className="book-card">
      <img src={normalizedBook.thumbnail || placeholderCover} alt="Book cover" />
      <div className="book-details">
        <span className="book-status">
          {normalizedBook.status === 'unread' && 'This book is currently on your TBR'}
          {normalizedBook.status === 'read' && 'You have read this book'}
          {normalizedBook.status === 'currently reading' && 'You are reading this book'}
        </span>
        <h3>{normalizedBook.volumeInfo.title}</h3>
        <p>by {normalizedBook.volumeInfo.authors?.join(', ')}</p>
      </div>

      <div className="button-group">
        <button
          className="btn add-to-shelf-btn"
          onClick={() => onAddToShelf(normalizedBook)}
          disabled={normalizedBook.existsInLibrary}
          style={{
            backgroundColor: normalizedBook.existsInLibrary ? '#DBC0A4' : '#FA9939',
            cursor: normalizedBook.existsInLibrary ? 'not-allowed' : 'pointer',
          }}
        >
          {normalizedBook.existsInLibrary ? 'On Shelf' : 'Add to Shelf'}
        </button>

        <button
          className="btn dropdown-btn"
          onClick={() => toggleDropdown(normalizedBook.googleBookId)}
        >
          ▼
        </button>

        {dropdownVisible[normalizedBook.googleBookId] && (
          <div ref={dropdownRef} className="dropdown">
            <button
              onClick={() => handleStatusChange(normalizedBook, 'unread')}
              disabled={normalizedBook.status === 'unread'}
              style={{
                backgroundColor: normalizedBook.status === 'unread' ? '#DBC0A4' : '#FA9939',
                cursor: normalizedBook.status === 'unread' ? 'not-allowed' : 'pointer',
              }}
            >
              TBR
            </button>
            <button
              onClick={() => handleStatusChange(normalizedBook, 'read')}
              disabled={normalizedBook.status === 'read'}
              style={{
                backgroundColor: normalizedBook.status === 'read' ? '#DBC0A4' : '#FA9939',
                cursor: normalizedBook.status === 'read' ? 'not-allowed' : 'pointer',
              }}
            >
              Read
            </button>
            <button
              onClick={() => handleStatusChange(normalizedBook, 'currently reading')}
              disabled={normalizedBook.status === 'currently reading'}
              style={{
                backgroundColor: normalizedBook.status === 'currently reading' ? '#DBC0A4' : '#FA9939',
                cursor: normalizedBook.status === 'currently reading' ? 'not-allowed' : 'pointer',
              }}
            >
              Reading
            </button>
          </div>
        )}
      </div>

      {statusMessage[normalizedBook.googleBookId] && (
        <p className="status-message">{statusMessage[normalizedBook.googleBookId]}</p>
      )}
    </div>
  );
};

export default BookCard;
