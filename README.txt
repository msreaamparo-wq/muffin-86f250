HACK PRANK PAGE (HTML + CSS + JS)
=================================
Fake "hacked" screen for pranking friends. NOTHING is really hacked,
accessed, saved or sent anywhere. The webcam box is just random noise,
passwords are "********", IPs/hashes are randomly generated.

RUN
---
1. Unzip.
2. Open index.html in Chrome / Edge / Firefox (double-click).
   The hack screen starts immediately.
3. Browsers only allow fullscreen + sound after a user action, so it
   goes fullscreen on the victim's first click / key press / tap.

EXIT (secret - nothing is shown on screen)
------------------------------------------
- Laptop: press Ctrl+Shift+X -> hack screen disappears (blank white page).
- Phone : tap the top-left corner 5 times quickly (invisible - victim won't see it).
- Swiping/back out of fullscreen does NOT stop the prank; next tap goes fullscreen again.
- BACK LOCK: the back button/back-swipe is absorbed 10 times (each shows ACCESS DENIED), then back works.
  Change the number: BACK_LIMIT at the top of script.js.
- It can NOT block closing the tab, the home gesture, recent apps, or the power button.
- (Closing the tab / Alt+F4 always works too.)

FULLSCREEN ON PHONE
-------------------
- Android Chrome: tap anywhere ONCE -> goes true fullscreen (address bar hidden).
- iPhone Safari does NOT allow fullscreen from a webpage. Workaround:
  Share button -> "Add to Home Screen" -> open it from the home screen icon
  (opens with no browser bar). Android can also do: Chrome menu -> "Add to Home screen".

SEND TO SOMEONE
---------------
Drag the folder to Netlify Drop or GitHub Pages and send the link.

TIP: Only prank friends who'll laugh - not strangers, elders, or anyone
who might panic and do something rash (like paying someone/calling a number).

OPTIONAL: in script.js set EXIT_URL = 'https://www.google.com' to redirect after the secret exit.
