import { Routes, Route } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";

import SplashScreen from "../../pages/SplashScreen";
import WelcomeScreen from "../../pages/WelcomeScreen";
import PublicApplicationForm from "../../pages/PublicApplicationForm";
import CreateAccount from "../../pages/registration/CreateAccount";
import BusinessInformation from "../../pages/registration/BusinessInformation";
import SupportingDocuments from "../../pages/registration/SupportingDocuments";
import ApplicationType from "../../pages/registration/ApplicationType";
import Confirmation from "../../pages/registration/Confirmation";
import Login from "../../pages/Login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/apply/:linkId" element={<PublicApplicationForm />} />
        <Route path="/register/account" element={<CreateAccount />} />
        <Route path="/register/business" element={<BusinessInformation />} />
        <Route path="/register/documents" element={<SupportingDocuments />} />
        <Route path="/register/application-type" element={<ApplicationType />} />
        <Route path="/register/confirmation" element={<Confirmation />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  );
}
