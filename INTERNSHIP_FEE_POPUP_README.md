# Internship Fee Reminder Popup

## Overview
A responsive, feature-rich popup component that displays an internship fee reminder to students when they log in to the LMS.

## Features
✅ **Role-Based Display**: Only shows for users with role = "Student"
✅ **Smart Dismissal**: "Remind Me Later" dismisses for the current day only
✅ **Persistent Across Sessions**: Reappears on next login if not dismissed
✅ **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
✅ **Beautiful UI**: Modern gradient design with smooth animations
✅ **Accessibility**: Keyboard navigation and screen reader support

## Files Created
1. `src/components/InternshipFeeReminderPopup.js` - Main component
2. `src/components/InternshipFeeReminderPopup.css` - Styling with media queries
3. Modified: `src/App.js` - Added component integration

## How It Works

### Auto-Display Logic
- Checks if user role is "Student" via JWT token
- Shows popup 2 seconds after page load
- Only shows if:
  - User hasn't clicked "Remind Me Later" today
  - OR it's a new day since last dismissal

### Button Actions

#### Pay Now ✅
- Redirects to: `/student-fee-status`
- Customize the redirect URL in the component (line 53)

#### Remind Me Later ⏰
- Dismisses popup for the current day
- Stores dismissal state in localStorage
- Will show again on next day or next login

#### Close (X button)
- Closes popup temporarily
- Will show again on next page refresh
- Doesn't store dismissal state

## Customization Guide

### 1. Change Due Date
Edit line 18 in `InternshipFeeReminderPopup.js`:
```javascript
const [dueDate] = useState("31st January 2026"); // Change this
```

### 2. Update Contact Information
Edit line 19 in `InternshipFeeReminderPopup.js`:
```javascript
const [contactInfo] = useState("finance@example.com | +91-1234567890"); // Change this
```

### 3. Change Payment Redirect URL
Edit line 52-53 in `InternshipFeeReminderPopup.js`:
```javascript
const handlePayNow = () => {
  setShow(false);
  window.location.href = "/student-fee-status"; // Change this URL
};
```

### 4. Modify Display Delay
Edit line 32 in `InternshipFeeReminderPopup.js`:
```javascript
setTimeout(() => {
  setShow(true);
}, 2000); // Change delay in milliseconds (2000 = 2 seconds)
```

### 5. Change Colors/Styling
Edit `InternshipFeeReminderPopup.css`:
- Header gradient: lines 14-15
- Button gradients: lines 102 & 119
- Due date color: line 76

### 6. Make Due Date Dynamic (API Integration)
Replace static state with API call:
```javascript
const [dueDate, setDueDate] = useState("");

useEffect(() => {
  // Fetch due date from API
  fetch(`${API_BASE_URL}/fee/due-date/${userId}`)
    .then(res => res.json())
    .then(data => setDueDate(data.dueDate));
}, []);
```

### 7. Disable Popup Temporarily
Comment out the component in `App.js` (line 576):
```javascript
{/* <InternshipFeeReminderPopup /> */}
```

### 8. Show for Multiple Roles
Edit line 25 in `InternshipFeeReminderPopup.js`:
```javascript
// Current: only students
if (role === "Student") {

// Change to: students and another role
if (role === "Student" || role === "Intern") {
```

## Responsive Breakpoints
- **Desktop**: Full width modal (500px max)
- **Tablet** (768px): Adjusted padding and font sizes
- **Mobile** (480px): Stacked buttons, smaller text
- **Small Mobile** (360px): Further optimized
- **Landscape**: Scroll support for small screens

## Browser Compatibility
✅ Chrome, Firefox, Safari, Edge (latest versions)
✅ Mobile browsers (iOS Safari, Chrome Mobile)
✅ Supports dark mode (auto-detects system preference)

## Testing Checklist
- [ ] Login as a student and verify popup appears
- [ ] Click "Pay Now" and verify redirect
- [ ] Click "Remind Me Later" and refresh page (should not appear)
- [ ] Wait until next day and login (should appear again)
- [ ] Test on mobile, tablet, and desktop
- [ ] Test with different screen orientations
- [ ] Verify non-student roles don't see popup

## Troubleshooting

### Popup doesn't appear
1. Check JWT token contains role = "Student"
2. Clear localStorage: `localStorage.removeItem("feeReminderDismissed")`
3. Check browser console for errors

### Popup appears too often
- Increase delay time (line 32)
- Modify dismissal logic to store for longer period

### Styling issues
- Check if Bootstrap is loaded
- Verify CSS file is imported correctly
- Check for conflicting CSS rules

## Future Enhancements
- [ ] Add animation effects
- [ ] Multiple reminder types (different fee types)
- [ ] Email notification integration
- [ ] Payment status check before display
- [ ] Admin panel to configure message
- [ ] Multi-language support

## Support
For issues or questions, contact the development team.
