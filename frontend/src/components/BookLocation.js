import React, { useState } from 'react';
import {
  lendBook,
  markBorrowedBook,
  returnLentBook,
  returnBorrowedBook,
  sellBook,
  removeBookFromShelf,
} from '../services/api';

const BookLocation = ({ book, setStatusMessage, googleBookId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'lend', 'borrow', 'return', 'sell', 'remove'
  const [formData, setFormData] = useState({ person: '', dueDate: '' });
  const token = localStorage.getItem('token');

  const handleAction = async () => {
    try {
      if (selectedAction === 'lend') {
        await lendBook(token, googleBookId, formData.person);
      } else if (selectedAction === 'borrow') {
        await markBorrowedBook(token, googleBookId, formData.person);
      } else if (selectedAction === 'return') {
        if (book.locationId?.lent) {
          await returnLentBook(token, googleBookId);
        } else if (book.locationId?.borrowed) {
          await returnBorrowedBook(token, googleBookId);
        }
      } else if (selectedAction === 'sell') {
        await sellBook(token, googleBookId);
      } else if (selectedAction === 'remove') {
        await removeBookFromShelf(token, googleBookId);
      }

      setStatusMessage((prev) => ({
        ...prev,
        [googleBookId]: `${
          selectedAction === 'sell'
            ? 'Book marked as sold'
            : selectedAction === 'lend'
            ? 'Lent successfully'
            : selectedAction === 'borrow'
            ? 'Marked as borrowed'
            : selectedAction === 'return'
            ? 'Book returned successfully'
            : 'Book removed from shelf'
        }`,
      }));
      setModalVisible(false);
      setFormData({ person: '', dueDate: '' });
    } catch (error) {
      console.error('Error updating book location:', error.message);
    }
  };

  const locationStatus = book.locationId?.onShelf
    ? 'On Shelf'
    : book.locationId?.lent
    ? `Lent to ${book.locationId.lent.person}`
    : book.locationId?.borrowed
    ? `Borrowed from ${book.locationId.borrowed.person}`
    : 'Unknown';

  return (
    <div className="book-location">
      {/* Inline Location Status */}
      <p className="status-badge">
        {locationStatus}
      </p>

      {/* Action Button */}
      <button className="btn action-btn" onClick={() => setModalVisible(true)}>
        Update Location
      </button>

      {/* Modal */}
      {modalVisible && (
        <div className="overlay">
          <div className="modal">
            <h3>Update Book Location</h3>
            <div className="action-selector">
              <button onClick={() => setSelectedAction('lend')}>Lend</button>
              <button onClick={() => setSelectedAction('borrow')}>Borrow</button>
              <button onClick={() => setSelectedAction('return')}>Return</button>
              <button onClick={() => setSelectedAction('sell')}>Sell</button>
              <button onClick={() => setSelectedAction('remove')}>Remove</button>
            </div>

            {/* Dynamic Form */}
            {selectedAction && selectedAction !== 'sell' && selectedAction !== 'remove' && selectedAction !== 'return' && (
              <form>
                <label>
                  {selectedAction === 'lend' ? 'Lend to' : 'Borrow from'}
                  <input
                    type="text"
                    value={formData.person}
                    onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Return Date (Optional)
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </label>
              </form>
            )}

            {(selectedAction === 'sell' || selectedAction === 'remove' || selectedAction === 'return') && (
              <p>Are you sure you want to {selectedAction} this book?</p>
            )}

            <button onClick={handleAction}>Submit</button>
            <button onClick={() => setModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLocation;
