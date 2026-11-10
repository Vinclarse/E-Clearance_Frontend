import { useState, useEffect } from "react";
import apiClient from "../services/api";

function ProfileSection({ onAvatarUpdated }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    apiClient.get("student-profile/my-profile/")
      .then((res) => {
        setProfile(res.data);
        if (res.data.avatar_url) {
          setAvatarPreview(res.data.avatar_url);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to sync profile:", err);
        setLoading(false);
      });
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setPendingPreviewUrl(previewUrl);
    setShowModal(true);
    
    e.target.value = "";
  };

  const handleConfirmUpload = () => {
    if (!pendingAvatarFile) return;

    setAvatarPreview(pendingPreviewUrl);
    if (onAvatarUpdated) {
      onAvatarUpdated(pendingPreviewUrl);
    }
    setShowModal(false);
    
    // Triggers the top success sliding alert toast panel natively
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    const imgFormData = new FormData();
    imgFormData.append("avatar", pendingAvatarFile);

    apiClient.patch("student-profile/update-avatar/", imgFormData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then((res) => {
      if (res.data && res.data.avatar_url) {
        setAvatarPreview(res.data.avatar_url);
        if (onAvatarUpdated) {
          onAvatarUpdated(res.data.avatar_url);
        }
      }
      setPendingAvatarFile(null);
      setPendingPreviewUrl(null);
    })
    .catch((err) => {
      console.error("Failed to upload avatar image:", err);
      setPendingAvatarFile(null);
      setPendingPreviewUrl(null);
    });
  };

  const handleCancelUpload = () => {
    setPendingAvatarFile(null);
    setPendingPreviewUrl(null);
    setShowModal(false);
  };

  if (loading) {
    return <div className="tracker-blueprint-alert">Retrieving institutional profile rows...</div>;
  }

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name.charAt(0).toUpperCase()}${profile.last_name.charAt(0).toUpperCase()}`
    : profile?.name 
      ? profile.name.charAt(0).toUpperCase()
      : "A";

  const displayName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : profile?.name || "arlec";

  return (
    <div className="profile-grid-layout" style={{ position: "relative" }}>
      {/* Sliding system alert alert notification modal panel */}
      <div className={`profile-system-toast-alert-modal ${showToast ? "slide-in" : ""}`}>
        <div className="toast-alert-icon-check">✓</div>
        <div className="toast-alert-text-block">
          <h5>Photo Updated Successfully</h5>
          <p>Your official institutional student portal profile picture has been re-saved.</p>
        </div>
      </div>

      <div className="profile-left-card">
        <div className="profile-avatar-container-interactive">
          <label htmlFor="avatar-file-input-selector" className="avatar-uploader-click-wrapper">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="avatar-image-render-circle-fixed" />
            ) : (
              <div className="profile-avatar-circle">{initials}</div>
            )}
            <div className="avatar-mini-upload-badge">
              <svg 
                xmlns="http://w3.org" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#3a3c30" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ width: "14px", height: "14px" }}
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
          </label>
          <input 
            type="file" 
            id="avatar-file-input-selector" 
            className="hidden-file-input-completely" 
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageSelect}
          />
        </div>
        
        <h3 className="profile-name">{displayName}</h3>
        <p className="profile-id-number">{profile?.student_id || "202406010"}</p>
        <span className="profile-status-badge">{profile?.role || "STUDENT"}</span>
      </div>

      <div className="profile-right-container">
        <div className="profile-inner-capsule">
          <h3 className="capsule-title">Account Details</h3>
          <div className="info-item-block">
            <span className="info-label">Email Address</span>
            <span className="info-value">{profile?.email || "student202406033@dnsc.edu.ph"}</span>
          </div>
          <div className="info-item-block">
            <span className="info-label">Login Username</span>
            <span className="info-value">{profile?.username || "Student202406010"}</span>
          </div>
          <div className="info-item-block">
            <span className="info-label">System Role Group</span>
            <span className="info-value">Students</span>
          </div>
        </div>

        <div className="profile-inner-capsule">
          <h3 className="capsule-title">Institutional Scope</h3>
          <div className="info-item-block">
            <span className="info-label">Academic Program</span>
            <span className="info-value">{profile?.course || "BSIT 3-C"}</span>
          </div>
          <div className="info-item-block">
            <span className="info-label">Organizational Scope</span>
            <span className="info-value">Institute of Computing</span>
          </div>
          <div className="info-item-block">
            <span className="info-label">Assigned Requirements</span>
            <span className="info-value">6 Sequential Items</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="profile-avatar-modal-overlay">
          <div className="profile-avatar-modal-card-box">
            <h4>Confirm Profile Picture</h4>
            <p>Would you like to set this image as your official institutional profile picture?</p>
            
            <div className="profile-avatar-modal-preview-zone">
              <img src={pendingPreviewUrl} alt="Pending Preview" className="profile-avatar-modal-image-element" />
            </div>

            <div className="profile-avatar-modal-actions-row">
              <button type="button" className="submit-request-form-btn-cancel" onClick={handleCancelUpload}>
                Cancel
              </button>
              <button type="button" className="submit-request-form-btn-aligned" onClick={handleConfirmUpload}>
                Confirm Picture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
