import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function SubmitIdea() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
 

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

     const response = await fetch(
  "https://startup-idea-validator-r6si.onrender.com/analyzeidea",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      category,
      description,
      created_by: "User"
    }),
  }
);

console.log("STATUS:", response.status);

const data = await response.json();

console.log("DATA:", data);

if (!response.ok) {
  alert("Error: " + JSON.stringify(data));
  return;
}

navigate(`/report/${data.idea_id}`)

    } catch (error) {

      console.error(error);
      alert("Backend connection failed");

    } finally {

      setLoading(false);

    }

  };

  return (
    <>
      <Navbar />

      <div className="container py-5">

        <div className="row justify-content-center">

          <div className="col-lg-8">

            <div
              className="analyze-card p-5"
              data-aos="fade-up"
            >

              <div className="text-center mb-5">

                <span className="badge bg-light text-primary border rounded-pill px-4 py-2">
                  🚀 AI Startup Validation
                </span>

                <h1 className="fw-bold mt-3">
                  Analyze Your Startup Idea
                </h1>

                <p className="text-muted">
                  Get market insights, SWOT analysis,
                  risk assessment and growth suggestions.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Startup Name
                  </label>

                  <input
                    type="text"
                    className="form-control custom-input"
                    placeholder="Example: StudyBuddy AI"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                </div>

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Category
                  </label>

                  <select
                    className="form-select custom-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >

                    <option value="">
                      Select Category
                    </option>

                    <option value="AI">
                      AI
                    </option>

                    <option value="EdTech">
                      EdTech
                    </option>

                    <option value="FinTech">
                      FinTech
                    </option>

                    <option value="HealthTech">
                      HealthTech
                    </option>

                    <option value="SaaS">
                      SaaS
                    </option>

                    <option value="E-Commerce">
                      E-Commerce
                    </option>

                  </select>

                </div>

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Startup Description
                  </label>

                  <textarea
                    rows="6"
                    className="form-control custom-input"
                    placeholder="Describe your startup idea in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>

                </div>

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Popular Categories
                  </label>

                  <div className="d-flex flex-wrap gap-2 mt-2">

                    <span className="tag-pill">
                      AI
                    </span>

                    <span className="tag-pill">
                      SaaS
                    </span>

                    <span className="tag-pill">
                      FinTech
                    </span>

                    <span className="tag-pill">
                      HealthTech
                    </span>

                    <span className="tag-pill">
                      EdTech
                    </span>

                  </div>

                </div>

                {/* <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Upload Pitch Deck
                    (Optional)
                  </label>

                  <input
                    type="file"
                    className="form-control custom-input"
                    onChange={(e) =>
                      setPitchDeck(
                        e.target.files[0]
                          ? e.target.files[0].name
                          : ""
                      )
                    }
                  />

                </div> */}

                <button
                  type="submit"
                  className="analyze-btn w-100"
                  disabled={loading}
                >

                  {
                    loading
                      ? "Analyzing..."
                      : "Analyze Startup Idea"
                  }

                </button>

              </form>

              {
                loading &&

                <div className="text-center mt-5">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>

                  <h5 className="mt-4">
                    AI Engine Working...
                  </h5>

                  <p className="text-muted">
                    Analyzing Market Potential,
                    Competition and Growth
                    Opportunities
                  </p>

                </div>
              }

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default SubmitIdea;