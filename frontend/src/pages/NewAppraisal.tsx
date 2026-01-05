import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ModernLayout } from "@/components/layouts/ModernLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const NewAppraisal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first step of the workflow
    const timer = setTimeout(() => {
      navigate("/appraiser-details");
    }, 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <ModernLayout title="New Appraisal" subtitle="Initializing">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">Starting secure appraisal session...</p>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
};

export default NewAppraisal;
