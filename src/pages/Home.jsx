import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
function Home() {
const navigate = useNavigate();
const [recentIdeas, setRecentIdeas] = useState([]);
useEffect(() => {

  fetch("http://localhost:5000/recent-validations")
    .then((res) => res.json())
    .then((data) => {
      setRecentIdeas(data);
    })
    .catch((err) => {
      console.error(err);
    });

}, []);
  const scrollToFeatures = () => {
    const section = document.getElementById("features");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">

        {/* Hero Section */}
        <section
          className="text-center py-5 my-5"
          data-aos="fade-up"
        >
          <h1 className="display-3 fw-bold hero-title">
            Startup Idea Validator
          </h1>

          <p className="lead text-muted mt-3">
            Validate your startup idea before investing
            time, money and resources.
          </p>

          <div className="mt-4 d-flex flex-column flex-sm-row justify-content-center gap-3">

            <button
    className="btn btn-dark btn-lg rounded-pill px-5"
    onClick={() => navigate("/submit")}
  >
    Analyze Idea
  </button>

  <button
    className="btn btn-outline-dark btn-lg rounded-pill px-5"
    onClick={scrollToFeatures}
  >
    Learn More
  </button>

          </div>
        </section>

        {/* Statistics */}
        <section
          className="py-5"
          data-aos="zoom-in"
        >
          <div className="row text-center">

            <div className="col-lg-4 col-md-4 col-sm-12 mb-4">
              <h1 className="fw-bold">500+</h1>
              <p className="text-muted">
                Ideas Analyzed
              </p>
            </div>

            <div className="col-lg-4 col-md-4 col-sm-12 mb-4">
              <h1 className="fw-bold">120+</h1>
              <p className="text-muted">
                Startups Validated
              </p>
            </div>

            <div className="col-lg-4 col-md-4 col-sm-12 mb-4">
              <h1 className="fw-bold">90%</h1>
              <p className="text-muted">
                Accuracy Rate
              </p>
            </div>

          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="py-5"
          data-aos="fade-up"
        >
          <h2 className="text-center fw-bold mb-5">
            Why Choose Startup Validator?
          </h2>

          <div className="row g-4">

            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="card feature-card shadow-sm border-0 p-4 text-center h-100">
                <h5 className="fw-bold">
                  Market Analysis
                </h5>
                <p className="text-muted">
                  Evaluate demand and market size.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="card feature-card shadow-sm border-0 p-4 text-center h-100">
                <h5 className="fw-bold">
                  Target Audience
                </h5>
                <p className="text-muted">
                  Identify your ideal customers.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="card feature-card shadow-sm border-0 p-4 text-center h-100">
                <h5 className="fw-bold">
                  SWOT Analysis
                </h5>
                <p className="text-muted">
                  Understand strengths and risks.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="card feature-card shadow-sm border-0 p-4 text-center h-100">
                <h5 className="fw-bold">
                  Growth Strategy
                </h5>
                <p className="text-muted">
                  Get business recommendations.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* How It Works */}
        <section
          className="py-5"
          data-aos="fade-right"
        >
          <h2 className="text-center fw-bold mb-5">
            How It Works
          </h2>

          <div className="row text-center">

            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-0 p-4 h-100">
                <h1>1️⃣</h1>
                <h5>Submit Idea</h5>
                <p className="text-muted">
                  Enter your startup concept.
                </p>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-0 p-4 h-100">
                <h1>2️⃣</h1>
                <h5>Analyze</h5>
                <p className="text-muted">
                  Generate insights instantly.
                </p>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-0 p-4 h-100">
                <h1>3️⃣</h1>
                <h5>Get Report</h5>
                <p className="text-muted">
                  View score and suggestions.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Recent Validations */}

<section
  className="py-5"
  data-aos="fade-up"
>
  <div className="text-center mb-5">

    <span className="badge bg-light text-primary border rounded-pill px-4 py-2">
      ✨ AI Powered Insights
    </span>

    <h1 className="fw-bold display-5 mt-3">
      Recent Validations
    </h1>

    <p className="text-muted">
      Explore startup ideas analyzed by our AI engine
    </p>

  </div>

  <div className="row g-4">

    {recentIdeas.map((idea) => (

      <div
        className="col-lg-4 col-md-6"
        key={idea.id}
      >

        <div className="validation-card h-100 p-4">

          <div className="d-flex justify-content-between">

            <div className="icon-box">
              🚀
            </div>

            <span className="category-pill">
              {idea.category}
            </span>

          </div>

          <h2 className="startup-title mt-4">
            {idea.title}
          </h2>

          <p className="startup-desc">
            {idea.description?.substring(0, 80)}...
          </p>

          <hr />

          <div className="score-panel">

            <div className="d-flex justify-content-between align-items-center">

              <div className="d-flex align-items-center">

                <div className="score-ring">
                  {idea.score}
                </div>

                <div className="ms-3">

                  <h4 className="mb-1">
                    Score: {idea.score} / 100
                  </h4>

                  <span className="score-status">

                    {idea.score >= 90
                      ? "Excellent Potential"
                      : idea.score >= 75
                      ? "Good Potential"
                      : idea.score >= 50
                      ? "Moderate Potential"
                      : "High Risk"}

                  </span>

                </div>

              </div>

              <div className="trend">
                📈
              </div>

            </div>

          </div>

        </div>

      </div>

    ))}

  </div>

</section>

        {/* CTA */}
        <section
          className="text-center py-5 my-5"
          data-aos="fade-up"
        >
          <h2 className="fw-bold">
            Ready to Validate Your Idea?
          </h2>

          <p className="text-muted">
            Turn your startup vision into reality.
          </p>

          <button
            className="btn btn-dark btn-lg rounded-pill px-5"
            onClick={() => navigate("/submit")}
          >
            Get Started
          </button>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default Home;