// src/components/BookLocation.js
import React, { useState } from 'react';
import {
  lendBook,
  markBorrowedBook,
  returnLentBook,
  returnBorrowedBook,
} from '../services/api';

const BookLocation = ({ book, setBooks, setStatusMessage, googleBookId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('lend');
  const [formData, setFormData] = useState({
    person: '',
    dateLent: getToday(),
    dateBorrowed: getToday(),
    dateDue: '',
  });
  const token = localStorage.getItem('token');

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  const resetForm = () => {
    setFormData({
      person: '',
      dateLent: getToday(),
      dateBorrowed: getToday(),
      dateDue: '',
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleAction = async () => {
    try {
      let successMessage = '';
      let updatedBook = { ...book }; // Clone the current book data
  
      if (selectedTab === 'lend') {
        if (!book.locationId?.lent?.person) {
          await lendBook(token, googleBookId, formData.person, formData.dateLent, formData.dateDue);
          successMessage = 'Book lent successfully.';
          updatedBook.locationId = { ...updatedBook.locationId, lent: { person: formData.person, dateLent: formData.dateLent } };
        } else {
          await returnLentBook(token, googleBookId);
          successMessage = 'Book returned successfully.';
          updatedBook.locationId.lent = null;
        }
      } else if (selectedTab === 'borrow') {
        if (book.locationId?.borrowed?.person) {
          await returnBorrowedBook(token, googleBookId);
          successMessage = 'Book returned successfully.';
          updatedBook.locationId.borrowed = null;
        } else {
          await markBorrowedBook(token, googleBookId, formData.person, formData.dateBorrowed);
          successMessage = 'Book borrowed successfully.';
          updatedBook.locationId = { ...updatedBook.locationId, borrowed: { person: formData.person, dateBorrowed: formData.dateBorrowed } };
        }
      }
  
      setStatusMessage((prev) => ({ ...prev, [googleBookId]: successMessage }));
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.googleBookId === googleBookId ? updatedBook : b
        )
      );
      closeModal();
    } catch (error) {
      console.error('Error updating book location:', error.message);
      setStatusMessage((prev) => ({
        ...prev,
        [googleBookId]: 'An error occurred. Please try again.',
      }));
    }
  };
  

  const renderForm = (labelText, dateField) => (
    <form
      className="action-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleAction();
      }}
    >
      <label className="action-form-top-row">
        <span>{labelText}</span>
        <input
          type="text"
          placeholder="e.g. John Doe"
          value={formData.person}
          onChange={(e) => setFormData({ ...formData, person: e.target.value })}
          required
        />
      </label>
      <div className="action-form-bottom-row">
        <label className="action-form-bottom-row-left">
          <span>{dateField}</span>
          <input
            type="date"
            value={formData[dateField === 'Date Lent' ? 'dateLent' : 'dateBorrowed']}
            onChange={(e) =>
              setFormData({
                ...formData,
                [dateField === 'Date Lent' ? 'dateLent' : 'dateBorrowed']: e.target.value,
              })
            }
          />
        </label>
        {selectedTab === 'lend' && (
          <label className="action-form-bottom-row-right">
            <span>Due Date (Optional)</span>
            <input
              type="date"
              value={formData.dateDue}
              onChange={(e) => setFormData({ ...formData, dateDue: e.target.value })}
            />
          </label>
        )}
      </div>
      <div className="action-buttons">
        <button type="submit" className="submit-btn">Submit</button>
        <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );

  const renderReturnContent = (action, person) => (
    <div>
      <p>
        This book is currently {action.toLowerCase()} by/from <strong>{person}</strong>. Return this book?
      </p>
      <div className="action-buttons">
        <button className="submit-btn" onClick={handleAction}>Return</button>
        <button className="cancel-btn" onClick={closeModal}>Cancel</button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (selectedTab === 'lend') {
      return book.locationId?.lent?.person
        ? renderReturnContent('Lent', book.locationId.lent.person)
        : renderForm('Lend to', 'Date Lent');
    }
    if (selectedTab === 'borrow') {
      return book.locationId?.borrowed?.person
        ? renderReturnContent('Borrowed', book.locationId.borrowed.person)
        : renderForm('Borrow from', 'Date Borrowed');
    }
  };

  return (
    <div className="book-location">
      <button className="btn action-btn" onClick={() => setModalVisible(true)}>
        Update Location
      </button>
      {modalVisible && (
        <div className="overlay">
          <div className="modal">
            <div className="folder-tabs">
              {['lend', 'borrow'].map((tab) => (
                <div
                  key={tab}
                  className={`folder-tab ${selectedTab === tab ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
            <div className="content-section">{renderContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLocation;
