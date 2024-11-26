import React, { useEffect, useState } from "react";
import placeholderProfile from "../assets/example-pfp.jpeg";
import "../App.css";
import { getBooksByStatus } from "../services/api";
import ProgressBar from "./ProgressBar";
import RandomBookPicker from "./RandomBookPicker";

const Dashboard = ({ username }) => {
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentlyReadingBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await getBooksByStatus(token, "currently-reading");
        console.log(response.data.books);
        setCurrentlyReadingBooks(response.data.books);
      } catch (err) {
        setError("Error fetching currently reading books");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentlyReadingBooks();
  }, []);

  return (
    <div className="dashboard">
      {/* Profile Section */}
      <div className="profile-picture">
        <img src={placeholderProfile} alt="Profile" />
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2>{username}'s Library</h2>

        {/* Currently Reading Section */}
        <div className="currently-reading-section-small">
          <h3>Currently Reading</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : currentlyReadingBooks.length > 0 ? (
            <div className="currently-reading-books-small">
              {currentlyReadingBooks.map((book) => (
                <div
                  className="currently-reading-card-small"
                  key={book.bookId.googleBookId}
                >
                  <img
                    src={book.bookId.thumbnail}
                    alt={book.bookId.title}
                    className="book-thumbnail-small"
                  />
                  <div className="book-info-small">
                    <p className="book-title-small">{book.bookId.title}</p>
                    <p className="book-author-small">
                      {book.bookId.authors?.join(", ")}
                    </p>
                    <ProgressBar
                      progress={book.progress}
                      googleBookId={book.googleBookId}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-currently-reading">
              No books currently being read
            </p>
          )}
        </div>
      </div>

      {/* Random Book Picker Section */}
      <div className="random-book-picker-section">
        <RandomBookPicker token={localStorage.getItem("token")} />
      </div>
    </div>
  );
};

export default Dashboard;
