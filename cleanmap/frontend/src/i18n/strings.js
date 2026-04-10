// ── Internationalization string map ───────────────────────────────────
// Every user-visible string in the app lives here.
// Add new languages by adding a new key to the STRINGS object.

const STRINGS = {
  en: {
    // Topbar
    appName: "CleanMap",
    reportSpot: "Report Spot",
    apiError: "API error",

    // Dashboard
    total: "Total",
    pending: "Pending",
    inProgress: "In Progress",
    cleaned: "Cleaned",
    pendingProof: "Pending Proof",

    // Sidebar
    liveReports: "Live Reports",
    all: "All",
    active: "Active",
    sort: "Sort:",
    nearestFirst: "Nearest first",
    newestFirst: "Newest first",
    enableLocation: "Enable location to sort by distance",
    noReportsMatch: "No reports match this filter.",
    claimedBy: "Claimed",
    cleanedBy: "Cleaned",
    by: "by",
    anonymous: "Anonymous",
    reportedBy: "Reported by",
    claim: "Claim",
    markCleaned: "Mark Cleaned",
    done: "Done",
    pendingProofShort: "Pending Proof",
    noDescription: "No description",
    unknown: "Unknown",
    score: "Score",

    // Map popups
    claimForCleanup: "Claim for Cleanup",
    markAsCleaned: "Mark as Cleaned",
    enterNameClaim: "Enter your name to claim this spot:",
    enterNameClean: "Enter your name to mark as cleaned:",
    updating: "Updating...",
    volunteerScore: "Volunteer Score",

    // Report form
    reportGarbageSpot: "Report Garbage Spot",
    location: "Location",
    setLocation: "Set a location — use My Location or click the map.",
    attachPhoto: "Please attach a photo of the waste.",
    useMyLocation: "Use My Location",
    locating: "Locating...",
    orClickMap: "— or click anywhere on the map —",
    mapHint: "Tap the map to drop a pin, then open the form",
    severity: "Severity",
    yourName: "Your Name (for credit)",
    namePlaceholder: "e.g. Priya S. or Anonymous",
    description: "Description",
    descPlaceholder: "Describe what you see — type of waste, size, smell, nearby landmark...",
    photo: "Photo",
    clickAttach: "Click to attach a photo",
    submitting: "Submitting...",
    submitReport: "Submit Report",
    submissionFailed: "Submission failed",
    reportSuccess: "Report submitted! Thank you.",
    geoNotSupported: "Geolocation not supported.",
    geoFailed: "Could not get location. Click the map to drop a pin.",
    low: "Low",
    medium: "Medium",
    high: "High",

    // Before/After
    beforeAfter: "Before & After",
    before: "Before",
    after: "After",
    noAfterPhoto: "No after photo uploaded yet",

    // After photo modal
    uploadAfterPhoto: "Upload After Photo",
    afterPhotoDesc: "Upload a photo showing the cleaned spot as proof of your cleanup.",
    clickUploadAfter: "Click to upload after photo",
    uploading: "Uploading...",
    submitCleanup: "Submit Cleanup Proof",
    afterPhotoRequired: "Please upload an after photo as cleanup proof.",

    // Leaderboard
    leaderboard: "Leaderboard",
    rank: "#",
    volunteer: "Volunteer",
    cleanups: "Cleanups",
    totalScore: "Total Score",
    pts: "pts",
    noVolunteers: "No volunteers yet. Be the first!",
    topVolunteers: "Top Volunteers",

    // Language
    language: "Language",
    english: "English",
    tamil: "தமிழ்",

    // Loading
    loadingApp: "Loading CleanMap...",

    // Statuses
    statusPending: "PENDING",
    statusInProgress: "IN PROGRESS",
    statusCleaned: "CLEANED",
    statusPendingProof: "PENDING PROOF",
  },

  ta: {
    // Topbar
    appName: "கிளீன்மேப்",
    reportSpot: "புகார் செய்",
    apiError: "API பிழை",

    // Dashboard
    total: "மொத்தம்",
    pending: "நிலுவையில்",
    inProgress: "செயலில்",
    cleaned: "சுத்தம் செய்யப்பட்டது",
    pendingProof: "ஆதாரம் நிலுவையில்",

    // Sidebar
    liveReports: "நேரடி புகார்கள்",
    all: "அனைத்தும்",
    active: "செயலில்",
    sort: "வரிசை:",
    nearestFirst: "அருகிலுள்ளவை",
    newestFirst: "புதியவை முதலில்",
    enableLocation: "தூரத்தின் படி வரிசைப்படுத்த இருப்பிடத்தை இயக்கவும்",
    noReportsMatch: "இந்த வடிப்பானுக்கு பொருந்தும் புகார்கள் இல்லை.",
    claimedBy: "எடுத்துக்கொண்டவர்",
    cleanedBy: "சுத்தம் செய்தவர்",
    by: "மூலம்",
    anonymous: "அநாமதேய",
    reportedBy: "புகாரளித்தவர்",
    claim: "எடுத்துக்கொள்",
    markCleaned: "சுத்தம்",
    done: "முடிந்தது",
    pendingProofShort: "ஆதாரம் தேவை",
    noDescription: "விளக்கம் இல்லை",
    unknown: "தெரியாத இடம்",
    score: "மதிப்பெண்",

    // Map popups
    claimForCleanup: "சுத்தம் செய்ய எடுத்துக்கொள்",
    markAsCleaned: "சுத்தமாக குறி",
    enterNameClaim: "உங்கள் பெயரை உள்ளிடவும் (எடுத்துக்கொள்ள):",
    enterNameClean: "உங்கள் பெயரை உள்ளிடவும் (சுத்தம் செய்ய):",
    updating: "புதுப்பிக்கிறது...",
    volunteerScore: "தன்னார்வலர் மதிப்பெண்",

    // Report form
    reportGarbageSpot: "குப்பை புகார்",
    location: "இடம்",
    setLocation: "இடத்தை அமைக்கவும் — என் இருப்பிடம் அல்லது வரைபடத்தில் அழுத்தவும்.",
    attachPhoto: "கழிவின் புகைப்படத்தை இணைக்கவும்.",
    useMyLocation: "என் இருப்பிடம்",
    locating: "கண்டறிகிறது...",
    orClickMap: "— அல்லது வரைபடத்தில் எங்கும் அழுத்தவும் —",
    mapHint: "வரைபடத்தில் அழுத்தி பின் செருகவும், பிறகு படிவத்தை திறக்கவும்",
    severity: "தீவிரம்",
    yourName: "உங்கள் பெயர் (பாராட்டுக்காக)",
    namePlaceholder: "எ.கா. பிரியா எஸ். அல்லது அநாமதேய",
    description: "விளக்கம்",
    descPlaceholder: "நீங்கள் என்ன பார்க்கிறீர்கள் என்று விவரிக்கவும் — கழிவு வகை, அளவு, நாற்றம், அருகிலுள்ள அடையாளம்...",
    photo: "புகைப்படம்",
    clickAttach: "புகைப்படம் இணைக்க அழுத்தவும்",
    submitting: "சமர்ப்பிக்கிறது...",
    submitReport: "புகார் சமர்ப்பி",
    submissionFailed: "சமர்ப்பிப்பு தோல்வி",
    reportSuccess: "புகார் சமர்ப்பிக்கப்பட்டது! நன்றி.",
    geoNotSupported: "புவிசார் இருப்பிடம் ஆதரிக்கப்படவில்லை.",
    geoFailed: "இருப்பிடத்தைப் பெற முடியவில்லை. வரைபடத்தில் அழுத்தவும்.",
    low: "குறைந்த",
    medium: "நடுத்தர",
    high: "அதிக",

    // Before/After
    beforeAfter: "முன் & பின்",
    before: "முன்",
    after: "பின்",
    noAfterPhoto: "இன்னும் பின் புகைப்படம் பதிவேற்றப்படவில்லை",

    // After photo modal
    uploadAfterPhoto: "பின் புகைப்படம் பதிவேற்று",
    afterPhotoDesc: "சுத்தம் செய்யப்பட்ட இடத்தின் புகைப்படத்தை ஆதாரமாக பதிவேற்றவும்.",
    clickUploadAfter: "பின் புகைப்படத்தை பதிவேற்ற அழுத்தவும்",
    uploading: "பதிவேற்றுகிறது...",
    submitCleanup: "சுத்தம் ஆதாரத்தை சமர்ப்பி",
    afterPhotoRequired: "சுத்தம் ஆதாரமாக பின் புகைப்படத்தை பதிவேற்றவும்.",

    // Leaderboard
    leaderboard: "தரவரிசை",
    rank: "#",
    volunteer: "தன்னார்வலர்",
    cleanups: "சுத்தப்படுத்தல்கள்",
    totalScore: "மொத்த மதிப்பெண்",
    pts: "புள்ளிகள்",
    noVolunteers: "இன்னும் தன்னார்வலர்கள் இல்லை. முதல் நபராக இருங்கள்!",
    topVolunteers: "சிறந்த தன்னார்வலர்கள்",

    // Language
    language: "மொழி",
    english: "English",
    tamil: "தமிழ்",

    // Loading
    loadingApp: "கிளீன்மேப் ஏற்றுகிறது...",

    // Statuses
    statusPending: "நிலுவையில்",
    statusInProgress: "செயலில்",
    statusCleaned: "சுத்தம்",
    statusPendingProof: "ஆதாரம் நிலுவையில்",
  },
};

export default STRINGS;
