import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SubmitIdea from "./pages/SubmitIdea";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/submit"
        element={<SubmitIdea />}
      />

     <Route
  path="/report"
  element={<Report />}
/>

<Route
  path="/report/:id"
  element={<Report />}
/>

      {/* <Route 
      path="/analyze"
      element={<Analyze/>}
      /> */}


      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
    </Routes>
  );
}

export default App;