import React, { useState } from 'react';
import {
  lendBook,
  markBorrowedBook,
  returnLentBook,
  returnBorrowedBook,
  sellBook,
  buyBook,
} from '../services/api';

const BookLocation = ({ book, setStatusMessage, googleBookId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('lend'); // Default tab
  const [formData, setFormData] = useState({
    person: '',
    dateLent: getToday(),
    dateBorrowed: getToday(),
    dateDue: '',
  });
  const token = localStorage.getItem('token');

  // Utility function for today's date
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  // Handles API actions based on the selected tab
  const handleAction = async () => {
    try {
      let successMessage = '';

      if (selectedTab === 'lend') {
        if (book.locationId?.lent.person) {
          await returnLentBook(token, googleBookId);
          successMessage = 'Book returned successfully';
        } else {
          await lendBook(token, googleBookId, formData.person, formData.dateLent);
          successMessage = 'Book lent successfully';
        }
      } else if (selectedTab === 'borrow') {
        if (book.locationId?.borrowed.person) {
          await returnBorrowedBook(token, googleBookId);
          successMessage = 'Book returned successfully';
        } else {
          await markBorrowedBook(token, googleBookId, formData.person, formData.dateBorrowed);
          successMessage = 'Book borrowed successfully';
        }
      } else if (selectedTab === 'sell') {
        if (book.locationId?.onShelf && !book.locationId?.borrowed) {
          await sellBook(token, googleBookId);
          successMessage = 'Book sold successfully';
        } else {
          await buyBook(token, googleBookId);
          successMessage = 'Book bought successfully';
        }
      }

      setStatusMessage((prev) => ({ ...prev, [googleBookId]: successMessage }));
      closeModal();
    } catch (error) {
      console.error('Error updating book location:', error.message);
      setStatusMessage((prev) => ({
        ...prev,
        [googleBookId]: 'An error occurred. Please try again.',
      }));
    }
  };

  // Handles closing the modal and resetting form data
  const closeModal = () => {
    setModalVisible(false);
    setFormData({
      person: '',
      dateLent: getToday(),
      dateBorrowed: getToday(),
      dateDue: '',
    });
  };

  // Renders form inputs based on the tab
  const renderForm = (labelText) => (
    <form
      className="action-form"
      onSubmit={(e) => {
        e.preventDefault(); // Prevent form submission
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
          <span>{labelText === 'Lend to' ? 'Date Lent' : 'Date Borrowed'}</span>
          <input
            type="date"
            value={
              labelText === 'Lend to'
                ? formData.dateLent
                : formData.dateBorrowed
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                [labelText === 'Lend to' ? 'dateLent' : 'dateBorrowed']: e.target.value,
              })
            }
          />
        </label>
        <label className="action-form-bottom-row-right">
          <span>Due Date (Optional)</span>
          <input
            type="date"
            value={formData.dateDue}
            onChange={(e) =>
              setFormData({ ...formData, dateDue: e.target.value })
            }
          />
        </label>
      </div>
      <div className="action-buttons">
        <button type="submit" className="submit-btn">
          Submit
        </button>
        <button
          type="button"
          className="cancel-btn"
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  // Renders modal content based on the selected tab
  const renderContent = () => {
    if (selectedTab === 'lend') {
      if (book.locationId?.lent.person) {
        return renderReturnContent('Lent', book.locationId.lent.person);
      }
      return renderForm('Lend to');
    }
    if (selectedTab === 'borrow') {
      if (book.locationId?.borrowed.person) {
        return renderReturnContent('Borrowed', book.locationId.borrowed.person);
      }
      return renderForm('Borrow from');
    }
    if (selectedTab === 'sell') {
      return book.locationId?.onShelf && !book.locationId?.borrowed
        ? renderSellContent('Sell')
        : renderSellContent('Buy');
    }
  };

  const renderReturnContent = (action, person) => (
    <div>
      <p>
        This book is currently {action.toLowerCase()} by/from{' '}
        <strong>{person}</strong>. Return this book?
      </p>
      <div className="action-buttons">
        <button className="submit-btn" onClick={handleAction}>
          Return
        </button>
        <button className="cancel-btn" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </div>
  );

  const renderSellContent = (action) => (
    <div>
      <p>
        {action === 'Sell'
          ? 'If you sell this book, it will be removed from your shelf, but all information will be retained.'
          : 'This book is not on your shelf. Buy it back to add it to your collection.'}
      </p>
      <div className="action-buttons">
        <button className="submit-btn" onClick={handleAction}>
          {action}
        </button>
        <button className="cancel-btn" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="book-location">
      {/* Action Button */}
      <button className="btn action-btn" onClick={() => setModalVisible(true)}>
        Update Location
      </button>

      {/* Modal */}
      {modalVisible && (
        <div className="overlay">
          <div className="modal">
            {/* Tabs */}
            <div className="folder-tabs">
              {['lend', 'borrow', 'sell'].map((tab) => (
                <div
                  key={tab}
                  className={`folder-tab ${selectedTab === tab ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
            {/* Content */}
            <div className="content-section">{renderContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLocation;
