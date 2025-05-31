import { Link } from 'react-router-dom';

export default function Footer() {
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.2rem", marginBottom: "0.2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
              © 2025 Algorythm. All rights reserved.
              <a href="https://github.com/zuzanapiarova" _target="blank">Zuzana's GitHub: https://github.com/zuzanapiarova</a>
              <a href="https://github.com/mifavoyke" _target="blank">Yeva's GitHub: https://github.com/mifavoyke</a>
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
  