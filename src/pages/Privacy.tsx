
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <PrivacyPolicy onBack={handleBack} />;
};

export default Privacy;
