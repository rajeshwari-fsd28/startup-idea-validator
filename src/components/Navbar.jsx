import { Link,NavLink, useNavigate } from "react-router-dom";
function Navbar() {

const navigate = useNavigate();

return ( <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top navbar-custom">


  <div className="container">

    <Link
      className="navbar-brand fw-bold fs-4"
      to="/"
    >
      🚀 Startup Validator
    </Link>

    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>

    <div
      className="collapse navbar-collapse"
      id="navbarNav"
    >

      <ul className="navbar-nav ms-auto align-items-lg-center">

        <NavLink
  to="/"
  className={({ isActive }) =>
    isActive
      ? "nav-link active-nav"
      : "nav-link"
  }
>
  Home
</NavLink>
        <li className="nav-item">
  <NavLink
    to="/submit"
    className={({ isActive }) =>
      isActive
        ? "nav-link active-nav"
        : "nav-link"
    }
  >
    Analyze
  </NavLink>
</li>
        <NavLink
  to="/report"
  className={({ isActive }) =>
    isActive
      ? "nav-link active-nav"
      : "nav-link"
  }
>
  Report
</NavLink>

       <NavLink
  to="/dashboard"
  className={({ isActive }) =>
    isActive
      ? "nav-link active-nav"
      : "nav-link"
  }
>
  Dashboard
</NavLink>

        <li className="nav-item ms-lg-3 mt-3 mt-lg-0">

          <button
  className="btn rounded-pill px-4 text-white"
  style={{ backgroundColor: "#7c3aed" }}
  onClick={() => navigate("/submit")}
>
  New Analysis
</button>

        </li>

      </ul>

    </div>

  </div>

</nav>


);
}

export default Navbar;
