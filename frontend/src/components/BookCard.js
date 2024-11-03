// src/components/BookCard.js
import React from 'react';
import placeholderCover from '../assets/book-nook-placeholder.png';
import BookCardButtons from './BookCardButtons';

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
  setUserLibraryBooks,
  setBooks,
  dropdownVisible,
  toggleDropdown,
  statusMessage,
  setStatusMessage,
}) => {
  const normalizedBook = normalizeBookData(book);

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

      <BookCardButtons
        onAddToShelf={onAddToShelf}
        normalizedBook={normalizedBook}
        toggleDropdown={toggleDropdown}
        dropdownVisible={dropdownVisible}
        setUserLibraryBooks={setUserLibraryBooks}
        setBooks={setBooks}
        setStatusMessage={setStatusMessage}
      />

      {statusMessage[normalizedBook.googleBookId] && (
        <p className="status-message">{statusMessage[normalizedBook.googleBookId]}</p>
      )}
    </div>
  );
};

export default BookCard;
