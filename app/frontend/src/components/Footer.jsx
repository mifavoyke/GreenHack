import { Link } from 'react-router-dom';

export default function Footer() {
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
              © 2024 PowerMap. All rights reserved.
            </div>
            <div className="footer-links">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/" className="footer-link">Terms of Service</Link>
            <Link to="/" className="footer-link">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  