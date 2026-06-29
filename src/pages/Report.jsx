import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Report() {

  const {id}=useParams();
  const [report, setReport] = useState(null);

useEffect(() => {

  const url = id
    ? `http://localhost:5000/report/${id}`
    : "http://localhost:5000/latestreport";

  fetch(url)
    .then(async (res) => {

      if (!res.ok) {
        throw new Error("Report not found");
      }

      const data = await res.json();
      setReport(data);

    })
    .catch((err) => {

      console.error(err);

      setReport({
        error: true
      });

    });

}, [id]);
const downloadPDF = () => {

  const doc = new jsPDF();

  let y = 20;

  // ---------------- Title ----------------

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Startup Validation Report", 20, y);

  y += 20;

  // ---------------- Startup Details ----------------

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);

  doc.text(`Startup Name : ${report.idea.title}`,20,y);
  y += 10;

  doc.text(`Category : ${report.idea.category}`,20,y);
  y += 10;

  doc.text(`Overall Score : ${report.analysis.score}/100`,20,y);
  y += 10;

  doc.text(`Potential : ${report.analysis.potential}`,20,y);

  // ---------------- KPI ----------------

  autoTable(doc,{
    startY:y+10,

    head:[["Metric","Score"]],

    body:[
      ["Market Demand",report.analysis.market_demand],
      ["Innovation",report.analysis.innovation],
      ["Scalability",report.analysis.scalability],
      ["Risk Level",report.analysis.risk_level],
    ],

    theme:"grid",

    headStyles:{
      fillColor:[124,58,237]
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ---------------- Overview ----------------

  doc.setFont("helvetica","bold");
  doc.setFontSize(16);
  doc.text("Startup Overview",20,y);

  y += 10;

  doc.setFont("helvetica","normal");
  doc.setFontSize(12);

  const desc = doc.splitTextToSize(
    report.idea.description,
    170
  );

  doc.text(desc,20,y);

  y += desc.length * 7 + 10;

  // ---------------- SWOT ----------------

  doc.setFont("helvetica","bold");
  doc.setFontSize(16);
  doc.text("SWOT Analysis",20,y);

  y += 10;

  autoTable(doc,{
    startY:y,

    head:[
      ["Strengths","Weaknesses"]
    ],

    body:[[
      report.swot.strengths,
      report.swot.weaknesses
    ]],

    theme:"grid",

    headStyles:{
      fillColor:[32,201,151]
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  autoTable(doc,{
    startY:y,

    head:[
      ["Opportunities","Threats"]
    ],

    body:[[
      report.swot.opportunities,
      report.swot.threats
    ]],

    theme:"grid",

    headStyles:{
      fillColor:[32,201,151]
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ---------------- Page Check ----------------

  if(y>250){
    doc.addPage();
    y=20;
  }

  // ---------------- Recommendations ----------------

  doc.setFont("helvetica","bold");
  doc.setFontSize(16);

  doc.text("Growth Recommendations",20,y);

  y += 10;

  doc.setFont("helvetica","normal");
  doc.setFontSize(12);

  report.analysis.recommendations
    .split("\n")
    .filter(item=>item.trim())
    .forEach(item=>{

      const txt = doc.splitTextToSize(
        "• " + item,
        165
      );

      doc.text(txt,25,y);

      y += txt.length * 7;

    });

  y += 10;

  // ---------------- Page Check ----------------

  if(y>240){
    doc.addPage();
    y=20;
  }

  // ---------------- Competitors ----------------

  doc.setFont("helvetica","bold");
  doc.setFontSize(16);

  doc.text("Competitor Analysis",20,y);

  y += 12;

  const competitors = JSON.parse(
    report.analysis.competitors
  );

  competitors.forEach((c,index)=>{

    if(y>235){
      doc.addPage();
      y=20;
    }

    doc.setFont("helvetica","bold");
    doc.setFontSize(13);

    doc.text(`${index+1}. ${c.name}`,20,y);

    y += 8;

    doc.setFont("helvetica","normal");
    doc.setFontSize(12);

    const strength = doc.splitTextToSize(
      "Strength : " + c.strength,
      165
    );

    doc.text(strength,25,y);

    y += strength.length * 7;

    const weakness = doc.splitTextToSize(
      "Weakness : " + c.weakness,
      165
    );

    doc.text(weakness,25,y);

    y += weakness.length * 7 + 6;

  });

  // ---------------- Advantages ----------------

  if(y>235){
    doc.addPage();
    y=20;
  }

  doc.setFont("helvetica","bold");
  doc.setFontSize(16);

  doc.text("Competitive Advantages",20,y);

  y += 10;

  doc.setFont("helvetica","normal");
  doc.setFontSize(12);

  report.analysis.competitive_advantage
    .split("\n")
    .filter(item=>item.trim())
    .forEach(item=>{

      const adv = doc.splitTextToSize(
        "• " + item,
        165
      );

      doc.text(adv,25,y);

      y += adv.length * 7;

    });

  // ---------------- Footer ----------------

  y += 15;

  if(y>270){

    doc.addPage();

    y=270;

  }

  doc.setDrawColor(180);

  doc.line(20,y,190,y);

  y += 8;

  doc.setFontSize(10);

  doc.text(
    "Generated by AI Startup Validator | © 2026",
    20,
    y
  );

  doc.save(`${report.idea.title}_Report.pdf`);

};
  // Parse competitors from database
const competitors = report?.analysis?.competitors
  ? JSON.parse(report.analysis.competitors)
  : [];

// Parse competitive advantages
const advantages = report?.analysis?.competitive_advantage
  ? report.analysis.competitive_advantage
      .split("\n")
      .filter(item => item.trim())
  : [];

 if (!report) {
  return (
    <>
      <Navbar />

      <div
        className="container d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div
          className="spinner-border text-primary"
          style={{ width: "4rem", height: "4rem" }}
        ></div>

        <h2 className="mt-4 fw-bold">
          AI is analyzing your startup...
        </h2>

        <p className="text-muted">
          Evaluating market demand, innovation, scalability,
          competitors and generating SWOT analysis.
        </p>
      </div>

      <Footer />
    </>
  );
}
if (report?.error) {
  return (
    <>
      <Navbar />

      <div
        className="container text-center py-5"
        style={{ minHeight: "70vh" }}
      >
        <h1 className="display-3 text-danger">
          404
        </h1>

        <h3 className="fw-bold">
          Report Not Found
        </h3>

        <p className="text-muted">
          The requested startup report does not exist.
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

        <div className="text-center mb-5">

          <span className="badge bg-light text-primary border rounded-pill px-4 py-2">
            🚀 Startup Analysis Complete
          </span>

          <h1 className="fw-bold mt-3">
            {report.idea?.title}
          </h1>

          <p className="text-muted">
            Comprehensive Startup Validation Report
          </p>

          <span className="badge bg-primary px-3 py-2">
            {report.idea?.category}
          </span>

        </div>

        {/* Score */}

        <div className="report-card text-center mb-5">

          <div className="score-circle mx-auto">
            {report.analysis?.score || 0}
          </div>

          <h3 className="mt-4">
            {report.analysis?.potential || "Pending"}
          </h3>

          <p className="text-muted">
            AI-generated startup validation based on market demand,
            innovation, scalability, and risk analysis.
          </p>

        </div>

        {/* Overview */}

        <div className="report-card mb-5">

          <h4 className="fw-bold mb-3">
            Startup Overview
          </h4>

          <p className="text-muted mb-0">
            {report.idea?.description}
          </p>

        </div>

        {/* KPI */}

        <div className="row g-4 mb-5">

          <div className="col-lg-3 col-md-6">
            <div className="metric-card">
              <h2>{report.analysis?.market_demand || 0}</h2>
              <p>Market Demand</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="metric-card">
              <h2>{report.analysis?.innovation || 0}</h2>
              <p>Innovation</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="metric-card">
              <h2>{report.analysis?.scalability || 0}</h2>
              <p>Scalability</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="metric-card">
              <h2>{report.analysis?.risk_level || 0}</h2>
              <p>Risk Level</p>
            </div>
          </div>

        </div>

        {/* SWOT */}

        <h2 className="fw-bold mb-4">
          SWOT Analysis
        </h2>

        <div className="row g-4 mb-5">

          <div className="col-md-6">
            <div className="swot-card strength">
              <h4>💪 Strengths</h4>

              <ul>
                {(report.swot?.strengths || "")
                  .split("\n")
                  .filter(item => item.trim())
                  .map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>

            </div>
          </div>

          <div className="col-md-6">
            <div className="swot-card weakness">
              <h4>⚠ Weaknesses</h4>

              <ul>
                {(report.swot?.weaknesses || "")
                  .split("\n")
                  .filter(item => item.trim())
                  .map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>

            </div>
          </div>

          <div className="col-md-6">
            <div className="swot-card opportunity">
              <h4>🚀 Opportunities</h4>

              <ul>
                {(report.swot?.opportunities || "")
                  .split("\n")
                  .filter(item => item.trim())
                  .map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>

            </div>
          </div>

          <div className="col-md-6">
            <div className="swot-card threat">
              <h4>🔥 Threats</h4>

              <ul>
                {(report.swot?.threats || "")
                  .split("\n")
                  .filter(item => item.trim())
                  .map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>

            </div>
          </div>

        </div>
        {/* Competitor Analysis */}

{/* Competitor Analysis */}

<h2 className="fw-bold mb-4">
  🏢 Competitor Analysis
</h2>

<div className="row g-4 mb-5">

  {competitors.map((company, index) => (

    <div className="col-lg-4" key={index}>

      <div className="competitor-card h-100">

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h4 className="fw-bold text-primary mb-0">
            {company.name}
          </h4>

          <span className="rank-badge">
            #{index + 1}
          </span>

        </div>

        <hr />

        <div className="mb-3">

          <h6 className="text-success fw-bold">
            ✅ Strength
          </h6>

          <p className="text-muted mb-0">
            {company.strength}
          </p>

        </div>

        <div>

          <h6 className="text-danger fw-bold">
            ⚠ Weakness
          </h6>

          <p className="text-muted mb-0">
            {company.weakness}
          </p>

        </div>

      </div>

    </div>

  ))}

</div>
{/* Competitive Advantages */}

<h2 className="fw-bold mb-4">
  ⭐ Competitive Advantages
</h2>

<div className="advantage-card">

  <h5 className="fw-bold mb-4">
    Why This Startup Can Win
  </h5>

  <div className="row">

    {advantages.map((item, index) => (

      <div className="col-md-6 mb-3" key={index}>

        <div className="advantage-item">

          <span className="tick">
            ✔
          </span>

          {item}

        </div>

      </div>

    ))}

  </div>

</div>

        {/* Recommendations */}

        <h2 className="fw-bold mb-4">
          Growth Recommendations
        </h2>

        <div className="row g-4 mb-5">

          {(report.analysis?.recommendations || "")
            .split("\n")
            .filter(item => item.trim())
            .map((item, index) => (
              <div className="col-md-6" key={index}>
                <div className="recommend-card">
                  ✅ {item}
                </div>
              </div>
            ))}

        </div>
         {/* Download PDF */}
        

        <div className="text-center mb-5">

          <button
            className="btn btn-primary btn-lg px-5"
            onClick={downloadPDF}
          >
            📄 Download Professional Report
          </button>

        </div>

      </div>
    
      <Footer />
    </>
  );
}

export default Report;