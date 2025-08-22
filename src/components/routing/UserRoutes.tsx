import { Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import Layout from "../Layout";

import Dashboard from "../../pages/Dashboard";
import ProgramDashboard from "../../pages/ProgramDashboard";
import Analytics from "../../pages/Analytics";
import RoadmapGenerator from "../../pages/RoadmapGenerator";
import Resources from "../../pages/Resources";
import LearningModules from "../../pages/LearningModules";
import Toolkit from "../../pages/Toolkit";
import Community from "../../pages/Community";
import FundingFinder from "../../pages/FundingFinder";
import ExpertSessions from "../../pages/ExpertSessions";
import Marketplace from "../../pages/Marketplace";
import MentorshipHub from "../../pages/MentorshipHub";
import Applications from "../../pages/Applications";
import Profile from "../../pages/Profile";
import DataInput from "../../pages/DataInput";

export default function UserRoutes() {
  return (
    <>
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="program/:programId" element={<ProgramDashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="roadmap" element={<RoadmapGenerator />} />
        <Route path="resources" element={<Resources />} />
        <Route path="learning" element={<LearningModules />} />
        <Route path="toolkit" element={<Toolkit />} />
        <Route path="community" element={<Community />} />
        <Route path="funding" element={<FundingFinder />} />
        <Route path="experts" element={<ExpertSessions />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="mentorship" element={<MentorshipHub />} />
        <Route path="applications" element={<Applications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="data-input" element={<DataInput />} />
      </Route>
    </>
  );
}
