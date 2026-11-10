import { useState, useEffect } from "react";
import dnscLogo from "../assets/dnsc-logo.jpg";
import apiClient from "../services/api";
import { signOut } from "../services/auth";
import "../styles/navigation.css";

function Navigation({ activeTab, setActiveTab, avatarUrl, userInitials, injectedAlert, clearInjectedAlert }) {
  const [showNotification, setShowNotification] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [readInjectedAlertId, setReadInjectedAlertId] = useState(null);

  useEffect(() => {
    apiClient.get("student-clearances/my-clearances/")
      .then((res) => {
        const items = res.data?.items || [];
        const builtNotifications = [];

        items.forEach((item) => {
          if (item.status === "cleared" || item.status === "CLEARED") {
            builtNotifications.push({
              id: `clear-${item.id}`,
              text: `Your clearance requirement for ${item.requirement_name} has been officially APPROVED.`,
              type: "success",
              time: "Just now"
            });
          } else if (item.status === "deficiency" || item.status === "DEFICIENCY") {
            builtNotifications.push({
              id: `def-${item.id}`,
              text: `Attention: An active DEFICIENCY has been logged under ${item.requirement_name}.`,
              type: "danger",
              time: "Action required"
            });
          }
        });

        if (builtNotifications.length === 0) {
          builtNotifications.push({
            id: "welcome-system",
            text: "Welcome to the new DNSC Clearance Portal. All your tracking paths are fully operational.",
            type: "info",
            time: "System"
          });
        }

        setNotifications(builtNotifications);
        setHasUnread(builtNotifications.length > 0);
      })
      .catch((err) => {
        console.error("Failed to load clearance parameters:", err);
      });
  }, [activeTab]);

  const notificationsToDisplay = injectedAlert
    ? [injectedAlert, ...notifications]
    : notifications;
  const hasUnreadNotifications =
    hasUnread || Boolean(injectedAlert && injectedAlert.id !== readInjectedAlertId);

  const toggleNotification = () => {
    setShowNotification(!showNotification);
    if (!showNotification) {
      setHasUnread(false);
      setReadInjectedAlertId(injectedAlert?.id ?? null);
    }
    if (showProfile) setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    if (showNotification) setShowNotification(false);
  };

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveTab(tabName);
    setShowProfile(false);
    setShowNotification(false);
  };

  const handleClearNotifications = (e) => {
    e.stopPropagation();
    setNotifications([]);
    setHasUnread(false);
    setReadInjectedAlertId(injectedAlert?.id ?? null);
    clearInjectedAlert?.();
  };

  return (
    <nav className="navigation-wrapper">
      <button
        type="button"
        className="logo-section desktop-brand"
        onClick={(e) => handleTabClick(e, "dashboard")}
      >
        <img src={dnscLogo} alt="DNSC Logo" />
        <span className="desktop-brand-info">
          <strong>ClearanceDNSC</strong>
          <small>Student portal</small>
        </span>
      </button>

      <div className="navigation-card">
        <ul className="menu-section">
          <li>
            <a 
              href="#" 
              className={activeTab === "dashboard" ? "active-link" : ""} 
              onClick={(e) => handleTabClick(e, "dashboard")}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === "profile" ? "active-link" : ""} 
              onClick={(e) => handleTabClick(e, "profile")}
            >
              Profile
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === "request" ? "active-link" : ""} 
              onClick={(e) => handleTabClick(e, "request")}
            >
              Clearance Request
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === "track" ? "active-link" : ""} 
              onClick={(e) => handleTabClick(e, "track")}
            >
              Clearance Tracker
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeTab === "download" ? "active-link" : ""} 
              onClick={(e) => handleTabClick(e, "download")}
            >
              Download / Print Clearance
            </a>
          </li>
        </ul>
      </div>

      <div className="right-icons">
        <div className="notification-container">
          <button
            type="button"
            className={`notification-btn ${showNotification ? 'active' : ''}`}
            onClick={toggleNotification}
            aria-label="Notifications"
            aria-expanded={showNotification}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {hasUnreadNotifications && (
              <div className={`notification-dot ${notificationsToDisplay.some(n => n.type === "danger") ? "danger-red" : ""}`}></div>
            )}
          </button>

          {showNotification && (
            <div className="notification-modal">
              <div className="notification-modal-header">
                <h5>System Notifications</h5>
                {notificationsToDisplay.length > 0 && <button type="button" onClick={handleClearNotifications}>Clear All</button>}
              </div>
              <div className="notification-modal-body-list">
                {notificationsToDisplay.length === 0 ? (
                  <div className="empty-notification-state">No new clearance updates or activities logs recorded.</div>
                ) : (
                  notificationsToDisplay.map((notif) => (
                    <div className={`notification-item-card-row ${notif.type}`} key={notif.id}>
                      <p>{notif.text}</p>
                      <span>{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-container">
          <button
            type="button"
            className={`profile-btn ${showProfile ? 'active' : ''}`}
            onClick={toggleProfile}
            aria-label="Open account menu"
            aria-expanded={showProfile}
          >
            <div className="profile-circle-placeholder" style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              ) : (
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#3a3c30", fontStyle: "normal" }}>{userInitials}</span>
              )}
            </div>
            <span>▼</span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="dropdown-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <div className="dropdown-text">
                <button type="button" onClick={signOut}>Sign Out</button>
                <button type="button" onClick={(e) => handleTabClick(e, "profile")}>Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
