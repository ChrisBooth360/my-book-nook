// src/components/BookLocation.js
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  lendBook,
  markBorrowedBook,
  returnLentBook,
  returnBorrowedBook,
  updateDueDate,
  removeBookFromShelf,
} from '../services/api';

const BookLocation = forwardRef(({ book, setBooks, googleBookId, setStatusMessage }, ref) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('lend');
  const [formData, setFormData] = useState({
    person: '',
    dateLent: getToday(),
    dateBorrowed: getToday(),
    dateDue: '',
  });
  const [localStatusMessage, setLocalStatusMessage] = useState('');
  const token = localStorage.getItem('token');

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    setSelectedTab,
    setModalVisible,
  }));

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
    setLocalStatusMessage('');
  };

  const handleAction = async () => {
    try {
      let successMessage = '';
      let updatedBook = { ...book };

      if (selectedTab === 'lend') {
        if (!book.locationId?.lent?.person) {
          await lendBook(token, googleBookId, formData.person, formData.dateLent, formData.dateDue);
          successMessage = 'Book lent successfully.';
          updatedBook.locationId = {
            ...updatedBook.locationId,
            lent: { person: formData.person, dateLent: formData.dateLent, dateDue: formData.dateDue },
          };
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
          await markBorrowedBook(token, googleBookId, formData.person, formData.dateBorrowed, formData.dateDue);
          successMessage = 'Book borrowed successfully.';
          updatedBook.locationId = {
            ...updatedBook.locationId,
            borrowed: { person: formData.person, dateBorrowed: formData.dateBorrowed, dateDue: formData.dateDue },
          };
        }
      }

      setLocalStatusMessage(successMessage);
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.googleBookId === googleBookId ? updatedBook : b
        )
      );
    } catch (error) {
      console.error('Error updating book location:', error.message);
      setLocalStatusMessage('An error occurred. Please try again.');
    }
  };

  const handleDueDateUpdate = async () => {
    try {
      await updateDueDate(
        token,
        googleBookId,
        formData.dateDue,
        selectedTab === 'lend' ? 'lent' : 'borrowed'
      );
      setLocalStatusMessage('Due date updated successfully.');
      setBooks((prevBooks) =>
        prevBooks.map((b) => {
          if (b.googleBookId === googleBookId) {
            const updatedLocation = { ...b.locationId };
            if (selectedTab === 'lend' && updatedLocation.lent) {
              updatedLocation.lent.dateDue = formData.dateDue;
            } else if (selectedTab === 'borrow' && updatedLocation.borrowed) {
              updatedLocation.borrowed.dateDue = formData.dateDue;
            }
            return { ...b, locationId: updatedLocation };
          }
          return b;
        })
      );
    } catch (error) {
      console.error('Error updating due date:', error.message);
      setLocalStatusMessage('An error occurred while updating the due date.');
    }
  };

  const handleRemove = async () => {
    try {
      await removeBookFromShelf(token, googleBookId);
      setBooks((prevBooks) =>
        prevBooks.filter((b) => b.googleBookId !== googleBookId)
      );
      setStatusMessage((prev) => ({
        ...prev,
        [googleBookId]: 'Book removed from library',
      }));
      closeModal(); 
    } catch (error) {
      console.error('Error removing book:', error.message);
      setLocalStatusMessage('Failed to remove the book. Try again later.');
    }
  };

  const renderRemoveContent = () => (
    <div className="remove-tab-content">
      <p>
        Are you sure you want to remove this book from your library?
      </p>
      <div className="action-buttons">
        <button className="remove-btn" onClick={handleRemove}>
          Yes
        </button>
        <button className="remove-cancel-btn" onClick={closeModal}>
          No
        </button>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return ''; // Handle empty date cases
    const options = { day: 'numeric', month: 'long', year: 'numeric' }; // dd MMMM yyyy
    return new Date(dateString).toLocaleDateString('en-UK', options);
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
          <span>{dateField} (Optional)</span>
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
        <label className="action-form-bottom-row-right">
          <span>Due Date (Optional)</span>
          <input
            type="date"
            value={formData.dateDue}
            onChange={(e) => setFormData({ ...formData, dateDue: e.target.value })}
          />
        </label>
      </div>
      <div className="action-buttons">
        <button type="submit" className="submit-btn">Submit</button>
        <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );

  const renderReturnContent = (action, person, dateDue) => (
    <div>
      {action === 'Lent' ?
      <p>
        You have lent this book to <strong>{person}</strong>.<br/> 
        {dateDue && <span>They should return it by  <strong>{formatDate(dateDue)}</strong>.</span>}
      </p> : <p>
        You have borrowed this book from <strong>{person}</strong>.<br/>
        {dateDue && <span>Return this book by <strong>{formatDate(dateDue)}</strong>.</span>}
      </p> }
      <div className="action-form-update">
        <label className="action-form-update-field">
          <span>Update Due Date</span>
          <input
            type="date"
            value={formData.dateDue}
            onChange={(e) => setFormData({ ...formData, dateDue: e.target.value })}
          />  
        </label>
        <button className="update-btn" onClick={handleDueDateUpdate}>Update</button>
      </div>
      <div className="action-buttons">
        <button className="submit-btn" onClick={handleAction}>Return</button>
        <button className="cancel-btn" onClick={closeModal}>Cancel</button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (selectedTab === 'lend') {
      return book.locationId?.lent?.person
        ? renderReturnContent('Lent', book.locationId.lent.person, book.locationId.lent.dateDue)
        : renderForm('Lend to', 'Date Lent');
    }
    if (selectedTab === 'borrow') {
      return book.locationId?.borrowed?.person
        ? renderReturnContent('Borrowed', book.locationId.borrowed.person, book.locationId.borrowed.dateDue)
        : renderForm('Borrow from', 'Date Borrowed');
    }
    if (selectedTab === 'remove') {
      return renderRemoveContent();
    }
  };

  return (
    <div className="book-location">
      <button
        className="btn action-btn"
        onClick={() => setModalVisible(true)}
      >
        Update Location
      </button>
      {modalVisible && (
        <div className="overlay">
          <div className="modal">
            <div className="folder-tabs">
              {['lend', 'borrow', 'remove'].map((tab) => (
                <div
                  key={tab}
                  className={`folder-tab ${
                    selectedTab === tab ? 'active' : ''
                  } ${tab === 'remove' ? 'remove' : ''}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
            {localStatusMessage && (
              <div className="confirmation-message">{localStatusMessage}</div>
            )}
            <div className="content-section">{renderContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
});


export default BookLocation;
