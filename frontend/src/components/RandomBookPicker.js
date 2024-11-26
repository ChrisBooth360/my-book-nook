import React, { useState } from "react";
import { getBooksByStatus, updateBookStatus } from "../services/api";
import BookCard from "./BookCard";
import "../App.css";

const RandomBookPicker = ({ token }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tbrBooks, setTbrBooks] = useState([]);
  const [randomBook, setRandomBook] = useState(null);
  const [error, setError] = useState("");

  const handleOpenModal = async () => {
    setShowModal(true);
    setIsLoading(true);
    setError("");

    try {
      const response = await getBooksByStatus(token, "TBR");
      const books = response.data;

      if (books.length === 0) {
        setError("No books in your TBR list to randomize!");
      } else {
        setTbrBooks(books);
      }
    } catch (err) {
      setError("Failed to fetch books. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTbrBooks([]);
    setRandomBook(null);
    setError("");
  };

  const handleChooseBook = () => {
    if (tbrBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tbrBooks.length);
      setRandomBook(tbrBooks[randomIndex]);
    }
  };

  return (
    <>
      <button className="randomize-btn" onClick={handleOpenModal}>
        Randomise
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <h2>Choose Your Next Read</h2>
            {isLoading ? (
              <p>Loading your TBR list...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : randomBook ? (
              <>
                <BookCard book={randomBook} />
                <button
                  className="action-btn"
                  onClick={() => {
                    // Add functionality to mark as "Currently Reading" here
                    updateBookStatus(token, randomBook.googleBookId, 'currently reading')
                  }}
                >
                  Add to Currently Reading
                </button>
              </>
            ) : (
              <>
                <p>
                  Ready to choose your next read? Randomly select from your TBR
                  list!
                </p>
                <button className="action-btn" onClick={handleChooseBook}>
                  Choose Your Next Read
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RandomBookPicker;
