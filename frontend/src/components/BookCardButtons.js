// src/components/BookCardButtons.js
import React, { useState, useEffect, useRef } from 'react';
import { updateBookStatus, addBookToShelf, removeBookFromShelf } from '../services/api';

const BookCardButtons = ({
  normalizedBook,
  setUserLibraryBooks,
  setBooks,
  setStatusMessage,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownVisible((prevVisible) => !prevVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownVisible && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible]);

  const handleStatusChange = async (status) => {
    const token = localStorage.getItem('token');

    try {
      await updateBookStatus(token, normalizedBook.googleBookId, status);
      setUserLibraryBooks((prev) => [
        ...prev.filter((b) => b.googleBookId !== normalizedBook.googleBookId),
        { googleBookId: normalizedBook.googleBookId, status },
      ]);

      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.googleBookId === normalizedBook.googleBookId
            ? { ...b, status, existsInLibrary: true }
            : b
        )
      );

      setStatusMessage((prev) => ({
        ...prev,
        [normalizedBook.googleBookId]: `Status changed to ${status}`,
      }));
    } catch (error) {
      console.error('Error updating book status:', error.message);
    }
  };

  const handleAddOrRemoveFromShelf = async () => {
    const token = localStorage.getItem('token');
    try {
      if (normalizedBook.existsInLibrary) {
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
          [normalizedBook.googleBookId]: 'Book removed from shelf',
        }));
      } else {
        await addBookToShelf(token, normalizedBook.googleBookId, 'unread');
        setUserLibraryBooks((prev) => [
          ...prev,
          { googleBookId: normalizedBook.googleBookId, status: 'unread' },
        ]);
        setBooks((prevBooks) =>
          prevBooks.map((b) =>
            b.googleBookId === normalizedBook.googleBookId
              ? { ...b, existsInLibrary: true, status: 'unread' }
              : b
          )
        );
        setStatusMessage((prev) => ({
          ...prev,
          [normalizedBook.googleBookId]: 'Book added to shelf',
        }));
      }
    } catch (error) {
      console.error('Error adding or removing book from shelf:', error.message);
    }
  };

  return (
    <div className="button-group">
      <button
        className="btn add-to-shelf-btn"
        onClick={handleAddOrRemoveFromShelf}
        style={{
          backgroundColor: normalizedBook.existsInLibrary ? '#DBC0A4' : '#FA9939',
          cursor: 'pointer',
        }}
      >
        {normalizedBook.existsInLibrary ? 'On Shelf' : 'Add to Shelf'}
      </button>

      <button className="btn dropdown-btn" onClick={toggleDropdown}>
        ▼
      </button>

      {dropdownVisible && (
        <div className="dropdown" ref={dropdownRef}>
          <button
            onClick={() => handleStatusChange('unread')}
            disabled={normalizedBook.status === 'unread'}
            style={{
              backgroundColor: normalizedBook.status === 'unread' ? '#DBC0A4' : '#FA9939',
              cursor: normalizedBook.status === 'unread' ? 'not-allowed' : 'pointer',
            }}
          >
            TBR
          </button>
          <button
            onClick={() => handleStatusChange('read')}
            disabled={normalizedBook.status === 'read'}
            style={{
              backgroundColor: normalizedBook.status === 'read' ? '#DBC0A4' : '#FA9939',
              cursor: normalizedBook.status === 'read' ? 'not-allowed' : 'pointer',
            }}
          >
            Read
          </button>
          <button
            onClick={() => handleStatusChange('currently reading')}
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
  );
};

export default BookCardButtons;
