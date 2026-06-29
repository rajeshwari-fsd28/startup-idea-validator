import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Dashboard() {

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {

    fetch("http://localhost:5000/dashboard")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setDashboard(data);
      })
      .catch((err) => {
        console.error(err);
      });

  }, []);

 if (!dashboard) {
  return (
    <>
      <Navbar />

      <div
        className="container d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "4rem", height: "4rem" }}
        ></div>

        <h3 className="mt-4 fw-bold">
          Loading Dashboard...
        </h3>

        <p className="text-muted">
          Fetching startup analytics and recent validations.
        </p>
      </div>

      <Footer />
    </>
  );
}

  return (
    <>
      <Navbar />

      <div className="container py-5">

        {/* Header */}

        <div className="mb-5">

          <h1 className="fw-bold">
            Dashboard
          </h1>

          <p className="text-muted">
            Welcome back, Founder.
          </p>

        </div>

        {/* Stats */}

        <div className="row g-4 mb-5">

          <div className="col-lg-4">
            <div className="dash-stat-card">

              <h2>
                {dashboard.total_ideas}
              </h2>

              <p>Total Ideas</p>

            </div>
          </div>

          <div className="col-lg-4">
            <div className="dash-stat-card">

              <h2>
                {dashboard.average_score}
              </h2>

              <p>Average Score</p>

            </div>
          </div>

          <div className="col-lg-4">
            <div className="dash-stat-card">

              <h2>
                {dashboard.highest_score}
              </h2>

              <p>Highest Score</p>

            </div>
          </div>

        </div>

        {/* Recent Analyses */}

        <h2 className="fw-bold mb-4">
          Recent Analyses
        </h2>

        <div className="row g-4 mb-5">

          {dashboard.recent_analyses?.map((idea) => (

            <div
              className="col-lg-4"
              key={idea.id}
            >

              <div className="dashboard-card">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <h4 className="mb-1">
                      {idea.title}
                    </h4>

                    <small className="text-muted">
                      {idea.category}
                    </small>

                  </div>

                  <div className="mini-score">
                    {idea.score}
                  </div>

                </div>

                <button
                  className="btn dashboard-btn mt-4 w-100"
                  onClick={() => navigate(`/report/${idea.id}`)}
                >
                  {/* View Report */}
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      <Footer />
    </>
  );
}

export default Dashboard;