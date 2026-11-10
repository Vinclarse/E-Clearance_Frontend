import { useState, useEffect, useCallback } from "react";
import Navigation from "../components/Navigation";
import MobileNavigation from "../components/MobileNavigation";
import HeroBanner from "../components/HeroBanner";
import OverviewCards from "../components/OverviewCards";
import MainContent from "../components/MainContent";
import ProfileSection from "../components/ProfileSection";
import ClearanceRequest from "../components/ClearanceRequest";
import ClearanceTracker from "../components/ClearanceTracker";
import DownloadClearance from "../components/DownloadClearance";
import apiClient from "../services/api";
import "../styles/theme.css";
import "../styles/dashboard.css";

const extractItems = (data) => {
  if (Array.isArray(data)) return data[0]?.items ?? data;
  return data?.items ?? [];
};

const extractClearance = (data) => (
  Array.isArray(data) ? data[0] ?? null : data ?? null
);

const previewRequirements = [
  { id: "preview-1", order_sequence: 1, requirement_name: "Student Affairs", authorizing_role_name: "Student Affairs Office", status: "cleared", cleared_at: "2026-11-03" },
  { id: "preview-2", order_sequence: 2, requirement_name: "Library", authorizing_role_name: "Library Office", status: "cleared", cleared_at: "2026-11-04" },
  { id: "preview-3", order_sequence: 3, requirement_name: "Finance Office", authorizing_role_name: "Accounting Office", status: "deficiency", remarks: "Please upload proof of payment for the outstanding balance.", amount_due: 250 },
  { id: "preview-4", order_sequence: 4, requirement_name: "Guidance Office", authorizing_role_name: "Guidance Office", status: "pending" },
  { id: "preview-5", order_sequence: 5, requirement_name: "Laboratory", authorizing_role_name: "Laboratory Office", status: "pending" },
  { id: "preview-6", order_sequence: 6, requirement_name: "Registrar", authorizing_role_name: "Registrar’s Office", status: "pending" },
];

const previewClearance = {
  overall_status: "deficiency",
  semester: "First Semester",
  academic_year: "2026-2027",
  clearance_type_name: "Student Clearance",
};

function StudentDashboard() {
  const isDesignPreview = new URLSearchParams(window.location.search).get("preview") === "true";
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [customNotification, setCustomNotification] = useState(null);
  const [requirements, setRequirements] = useState(() => isDesignPreview ? previewRequirements : []);
  const [clearanceRecord, setClearanceRecord] = useState(() => isDesignPreview ? previewClearance : null);
  const [clearanceError, setClearanceError] = useState("");
  const [loadingClearance, setLoadingClearance] = useState(!isDesignPreview);
  const [reloadKey, setReloadKey] = useState(0);
  const [requestItemId, setRequestItemId] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    if (isDesignPreview) {
      return () => window.removeEventListener("resize", handleResize);
    }

    apiClient.get("student-profile/my-profile/")
      .then((res) => {
        setProfile(res.data);
        if (res.data.avatar_url) {
          setAvatarPreview(res.data.avatar_url);
        }
      })
      .catch((err) => console.error("Failed to sync profile matrices:", err));

    return () => window.removeEventListener("resize", handleResize);
  }, [isDesignPreview]);

  useEffect(() => {
    if (isDesignPreview) return undefined;

    let isMounted = true;

    apiClient.get("student-clearances/my-clearances/")
      .then((res) => {
        if (!isMounted) return;
        const extractedItems = extractItems(res.data);
        setClearanceRecord(extractClearance(res.data));
        setRequirements(Array.isArray(extractedItems) ? extractedItems : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch student clearance:", err);
        setClearanceRecord(null);
        setRequirements([]);
        setClearanceError("We couldn’t load your clearance information. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoadingClearance(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDesignPreview, reloadKey]);

  const handleAvatarStateChange = (newUrl) => {
    setAvatarPreview(newUrl);
  };

  const handleGlobalStatusUpdate = (itemId, newStatus) => {
    setRequirements((prevItems) =>
      prevItems.map((item) =>
        item.id === parseInt(itemId) ? { ...item, status: newStatus } : item
      )
    );
  };

  const triggerUploadNotification = (officeName) => {
    setCustomNotification({
      id: `upload-event-${Date.now()}`,
      text: `Your settlement proof file for ${officeName} has been submitted successfully and is under review.`,
      type: "info",
      time: "Just now"
    });
  };

  const calculateOverallStatus = () => {
    const normalizeStatus = (status) => (status || "").toLowerCase().replace(/[\s-]+/g, "_");
    const deficiencyCount = requirements.filter(item => normalizeStatus(item.status) === "deficiency").length;
    const underReviewCount = requirements.filter(item => normalizeStatus(item.status) === "under_review").length;
    const clearedCount = requirements.filter(item => normalizeStatus(item.status) === "cleared").length;
    const recordStatus = normalizeStatus(clearanceRecord?.overall_status);

    if (deficiencyCount > 0 || recordStatus === "deficiency") return "DEFICIENCY";
    if (recordStatus === "completed" || (requirements.length > 0 && clearedCount === requirements.length)) return "COMPLETED";
    if (underReviewCount > 0 || recordStatus === "under_review") return "UNDER REVIEW";
    return "PENDING";
  };

  const openProofRequest = (itemId) => {
    setRequestItemId(itemId);
    setCurrentTab("request");
  };
  const clearRequestedItem = useCallback(() => setRequestItemId(null), []);
  const retryClearanceLoad = () => {
    setLoadingClearance(true);
    setClearanceError("");
    setReloadKey((key) => key + 1);
  };

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name.charAt(0).toUpperCase()}${profile.last_name.charAt(0).toUpperCase()}`
    : profile?.name 
      ? profile.name.charAt(0).toUpperCase()
      : "A";

  const overallStatus = calculateOverallStatus();

  return (
    <div className="dashboard-container">
      {isMobile ? (
        <MobileNavigation 
          activeTab={currentTab} 
          setActiveTab={setCurrentTab} 
          avatarUrl={avatarPreview} 
          userInitials={initials}
          injectedAlert={customNotification}
          clearInjectedAlert={() => setCustomNotification(null)}
        />
      ) : (
        <Navigation 
          activeTab={currentTab} 
          setActiveTab={setCurrentTab} 
          avatarUrl={avatarPreview} 
          userInitials={initials}
          injectedAlert={customNotification}
          clearInjectedAlert={() => setCustomNotification(null)}
        />
      )}

      <main className="dashboard-content">
        {isDesignPreview && currentTab === "dashboard" && (
          <div className="dashboard-preview-notice" role="status">
            Design preview — sample data, not live clearance information
          </div>
        )}
        {loadingClearance ? (
          <div className="dashboard-state" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <strong>Loading your clearance</strong>
            <span>Getting your latest requirements and progress.</span>
          </div>
        ) : clearanceError ? (
          <div className="dashboard-state dashboard-error-state" role="alert">
            <span className="dashboard-state-icon" aria-hidden="true">!</span>
            <strong>We couldn’t load your clearance</strong>
            <span>{clearanceError}</span>
            <button type="button" className="dashboard-retry-button" onClick={retryClearanceLoad}>
              Try again
            </button>
          </div>
        ) : !clearanceRecord ? (
          <div className="dashboard-state">
            <span className="dashboard-state-icon" aria-hidden="true">✓</span>
            <strong>No active clearance term</strong>
            <span>There isn’t an active clearance checklist for your account right now.</span>
          </div>
        ) : currentTab === "dashboard" ? (
          <div className="dashboard-canvas">
            <HeroBanner requirements={requirements} overallStatus={overallStatus} clearance={clearanceRecord} />
            <OverviewCards requirements={requirements} />
            <MainContent
              requirements={requirements}
              onUploadProof={isDesignPreview ? undefined : openProofRequest}
            />
          </div>
        ) : currentTab === "profile" ? (
          <div className="dashboard-canvas-clearance-request-fix">
            <ProfileSection onAvatarUpdated={handleAvatarStateChange} />
          </div>
        ) : currentTab === "request" ? (
          <div className="dashboard-canvas-clearance-request-fix">
            <ClearanceRequest 
              requirements={requirements} 
              onUploadSuccess={handleGlobalStatusUpdate}
              onUploadTriggered={triggerUploadNotification}
              requestItemId={requestItemId}
              onRequestItemHandled={clearRequestedItem}
            />
          </div>
        ) : currentTab === "track" ? (
          <div className="dashboard-canvas-clearance-request-fix">
            <ClearanceTracker requirements={requirements} overallStatus={overallStatus} />
          </div>
        ) : currentTab === "download" || currentTab === "clearance" ? (
          <div className="dashboard-canvas-clearance-request-fix">
            <DownloadClearance requirements={requirements} />
          </div>
        ) : (
          <div className="dashboard-canvas">
            <div className="alert-card">Section in active development.</div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;