// src/components/BookCardButtons.js
import React, { useState, useEffect, useRef } from 'react';
import { updateBookStatus, addBookToShelf } from '../services/api';

const BookCardButtons = ({
  normalizedBook,
  setUserLibraryBooks,
  setBooks,
  setStatusMessage,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  const toggleDropdown = (event) => {
    // Only toggle if the click is on the dropdown button itself
    if (dropdownButtonRef.current && dropdownButtonRef.current.contains(event.target)) {
      setDropdownVisible((prevVisible) => !prevVisible);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownVisible &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
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

      let statusMessage;
      switch (status) {
        case 'unread':
          statusMessage = 'Added to TBR Shelf';
          break;
        case 'read':
          statusMessage = "Added to Read Shelf";
          break;
        case 'currently reading':
          statusMessage = 'Added to Reading';
          break;
        case 'dnf':
          statusMessage = "Added to DNF Shelf"
          break;
        default:
          statusMessage = `Added to ${status}`;
          break;
      }

      setStatusMessage((prev) => ({
        ...prev,
        [normalizedBook.googleBookId]: statusMessage,
      }));
    } catch (error) {
      console.error('Error updating book status:', error.message);
    }
  };

  const handleAddToShelf = async (status) => {
    const token = localStorage.getItem('token');
    try {
      await addBookToShelf(token, normalizedBook.googleBookId, status);
      
      // Update user's library books
      setUserLibraryBooks((prev) => [
        ...prev,
        { googleBookId: normalizedBook.googleBookId, status },
      ]);
  
      // Update the books in the UI
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.googleBookId === normalizedBook.googleBookId
            ? { ...b, existsInLibrary: true, status }
            : b
        )
      );

      let statusMessage;
      switch (status) {
        case 'unread':
          statusMessage = 'Added to TBR Shelf';
          break;
        case 'read':
          statusMessage = "Added to Read Shelf";
          break;
        case 'currently reading':
          statusMessage = 'Added to Reading';
          break;
        case 'dnf':
          statusMessage = "Added to DNF Shelf"
          break;
        default:
          statusMessage = `Added to ${status}`;
          break;
      }

      setStatusMessage((prev) => ({
        ...prev,
        [normalizedBook.googleBookId]: statusMessage,
      }));
    } catch (error) {
      console.error('Error adding book to shelf:', error.message);
    }
  };
  

  const getButtonLabel = () => {
    if (!normalizedBook.existsInLibrary) return 'Add to Shelf';
    switch (normalizedBook.status) {
      case 'unread':
        return 'TBR Shelf';
      case 'read':
        return 'Read';
      case 'currently reading':
        return 'Reading';
      case 'dnf':
        return 'DNF';
      default:
        return 'On Shelf';
    }
  };

  return (
    <div className="button-group">
      <button
        className={`btn add-to-shelf-btn ${
          normalizedBook.existsInLibrary ? 'disabled-btn' : ''
        }`}
        onClick={
          !normalizedBook.existsInLibrary ? () => handleAddToShelf('unread') : undefined
        }
      >
        {getButtonLabel()}
      </button>

      <button
        className="btn dropdown-btn"
        onClick={toggleDropdown}
        ref={dropdownButtonRef}
      >
        ▼
      </button>

      {dropdownVisible && (
        <div className="dropdown" ref={dropdownRef}>
          <button
            className={`${normalizedBook.status === 'unread' ? 'dropdown-disabled-btn' : 'dropdown-menu-button'}`}
            onClick={!normalizedBook.existsInLibrary ? () => handleAddToShelf('unread') : () => handleStatusChange('unread')}
          >
            TBR Shelf
          </button>
          <button
            className={`${normalizedBook.status === 'currently reading' ? 'dropdown-disabled-btn' : 'dropdown-menu-button'}`}
            onClick={!normalizedBook.existsInLibrary ? () => handleAddToShelf('currently reading') : () => handleStatusChange('currently reading')}
          >
            Currently Reading
          </button>
          <button
            className={`${normalizedBook.status === 'read' ? 'dropdown-disabled-btn' : 'dropdown-menu-button'}`}
            onClick={!normalizedBook.existsInLibrary ? () => handleAddToShelf('read') : () => handleStatusChange('read')}
          >
            Read
          </button>
          <button
            className={`${normalizedBook.status === 'dnf' ? 'dropdown-disabled-btn' : 'dropdown-menu-button'}`}
            onClick={!normalizedBook.existsInLibrary ? () => handleAddToShelf('dnf') : () => handleStatusChange('dnf')}
          >
            DNF
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCardButtons;
