// src/components/BookCard.js
import React, { useState, useEffect, useRef } from 'react';
import placeholderCover from '../assets/book-nook-placeholder.png';
import BookCardButtons from './BookCardButtons';
import RatingBar from './RatingBar';
import ProgressBar from './ProgressBar';
import ReviewBar from './ReviewBar';
import BookLocation from './BookLocation';
import DOMPurify from 'dompurify';
import '../styles/App.css'
import '../styles/BookCard.css'

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
      saleInfo: { buyLink: book.buyLink || '#' },
      status: book.status || 'unread',
      existsInLibrary: true,
      googleBookId: book.googleBookId,
      rating: book.rating,
      progress: book.progress,
      review: book.review,
      locationId: book.locationId,
    };
  }

  return {
    ...book,
    volumeInfo: {
      ...book.volumeInfo,
      imageLinks: book.volumeInfo.imageLinks || defaultImageLinks,
    },
  };
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
  
  const bookLocationRef = useRef(null);


  useEffect(() => {
    if (statusMessage[normalizedBook.googleBookId]) {
      const timer = setTimeout(() => {
        setStatusMessage((prev) => {
          const updated = { ...prev };
          delete updated[normalizedBook.googleBookId];
          return updated;
        });
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [statusMessage, normalizedBook.googleBookId, setStatusMessage]);

  const handleRemoveClick = () => {
    if (bookLocationRef.current) {
      bookLocationRef.current.setSelectedTab('remove'); // Access the ref directly
      bookLocationRef.current.setModalVisible(true);
    } else {
      console.error('BookLocation ref is not available.');
    }
  };
    

  const handleToggleExpand = () => setIsExpanded((prevState) => !prevState);

  return (
    <div
      className={`book-card 
        ${normalizedBook.status === 'currently reading' ? 'currently-reading' : ''}
        ${normalizedBook.status === 'dnf' ? 'dnf' : ''} 
        ${isExpanded ? 'expanded' : ''}`}
    >
      {/* Book Thumbnail */}
      <div className="thumbnail" onClick={handleToggleExpand}>
        <img
          src={normalizedBook.volumeInfo.imageLinks.thumbnail || placeholderCover}
          alt="Book cover"
        />
      </div>

      {/* Book Details */}
      <div className="book-details">
        <div className="book-header" onClick={handleToggleExpand}>
          <h3>{normalizedBook.volumeInfo.title}</h3>
          <p>by {normalizedBook.volumeInfo.authors?.join(', ')}</p>
          {normalizedBook.status === 'read' || normalizedBook.status === 'dnf' ? (
            <RatingBar
              initialRating={normalizedBook.rating}
              googleBookId={normalizedBook.googleBookId}
            />
          ) : null}
          {normalizedBook.status === 'currently reading' ? (
            <ProgressBar
              progress={normalizedBook.progress}
              googleBookId={normalizedBook.googleBookId}
            />
          ) : null}
        </div>

        {isExpanded && (
          <div className="expanded-book-info">
            {normalizedBook.status === 'read' || normalizedBook.status === 'dnf' ? (
              <ReviewBar
                initialReview={normalizedBook.review}
                googleBookId={normalizedBook.googleBookId}
              />
            ) : null}
            <div className="small-expanded-book-info">
              <p>
                <strong>ISBN:</strong> {book.isbn || 'N/A'}
              </p>
              <p>
                <strong>Publisher:</strong> {normalizedBook.volumeInfo.publisher}
              </p>
              <p>
                <strong>Published:</strong> {normalizedBook.volumeInfo.publishedDate}
              </p>
              <p>
                <strong>Page Count:</strong> {normalizedBook.volumeInfo.pageCount}
              </p>
            </div>
            <p>
              <strong>Description:</strong>{' '}
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    normalizedBook.volumeInfo.description || 'No description available.'
                  ),
                }}
              />
            </p>
          </div>
        )}

        <div className="details-toggle" onClick={handleToggleExpand}>
          <p>{isExpanded ? 'less details' : 'more details'}</p>
        </div>
      </div>

      {/* Button Section */}
      <div className="button-section">
        <p className="status-message">
          {statusMessage[normalizedBook.googleBookId] || '\u00A0'}
        </p>

        <div className="book-card-buttons">
          <BookCardButtons
            normalizedBook={normalizedBook}
            setUserLibraryBooks={setUserLibraryBooks}
            setBooks={setBooks}
            setStatusMessage={setStatusMessage}
          />

          {normalizedBook.existsInLibrary && (
            <>
              <BookLocation
                className="book-location-button"
                ref={bookLocationRef} // No need for a state update here
                book={normalizedBook}
                setBooks={setBooks}
                setStatusMessage={setStatusMessage}
                googleBookId={normalizedBook.googleBookId}
              />
              <button
                className="btn remove-from-library-btn"
                onClick={handleRemoveClick}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
