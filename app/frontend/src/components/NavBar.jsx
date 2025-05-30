import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTowerObservation } from '@fortawesome/free-solid-svg-icons'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="navbar-brand flex items-center gap-2">
          <FontAwesomeIcon icon={faTowerObservation} />
            GreenBean
        </Link>
        {/* Navigation Links */}
        <div className="navbar-nav hidden">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/browse" className="navbar-link">
            Browse
          </Link>
        </div>

        {/* User Icon */}
        <button className="btn btn-outline">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>
    </nav>
  )
}
