Design and build a high-fidelity mobile dictionary application called “Falam Dictionary” for Falam Chin → English.

The product is an offline-first language reference app for quickly searching Falam vocabulary, understanding English meanings, hearing pronunciation, reviewing examples, and saving useful words.

The experience should feel calm, modern, friendly, trustworthy, spacious, readable, and fast. Use the clean language-first usability principles of modern translation apps, but create a completely original identity. Do not copy Papago, NAVER branding, logos, mascots, illustrations, exact layouts, exact colors, or proprietary components.

==================================================

1. # PRODUCT EXPERIENCE

Primary language direction:

Falam → English

Core interaction:

Open
↓
Search
↓
Understand
↓
Listen
↓
Learn
↓
Save

The dictionary should feel local-first:

Open the app
↓
Type a Falam word
↓
See instant local results

Do not make the primary search experience dependent on network loading.

Do not invent real Falam words. Use clearly labeled prototype content only:

“Falam word”
“English meaning”
“Falam example sentence”
“English translation”
“/pronunciation/”

Long Falam words, Unicode characters, diacritics, pronunciation text, long definitions, multiline examples, and large accessibility text must wrap naturally. Never truncate a Falam word in a way that creates ambiguity.

================================================== 2. VISUAL PERSONALITY
==================================================

The interface should feel:

Calm
Modern
Friendly
Trustworthy
Linguistic
Comfortable for long reading sessions

Avoid:

Corporate enterprise styling
Generic dictionary website styling
Social media styling
AI chatbot styling
Children’s app styling
Excessive decoration
Excessive gradients
Heavy shadows
Dense information walls
Overly colorful cards
Unnecessary filters
Complex navigation hierarchies

Use whitespace, typography, alignment, and subtle dividers for hierarchy. Do not put every section inside a card. Avoid nested cards.

The Falam language should remain the visual center of the product.

================================================== 3. EXACT COLOR TOKENS
==================================================

Use OKLCH color values exactly. Do not replace them with random colors.

LIGHT THEME

--paper: oklch(96.8% 0.012 154)
Primary warm/cool tinted app background.

--paper-deep: oklch(92.7% 0.018 154)
Outer canvas background and deeper background areas.

--surface: oklch(99.2% 0.006 154)
Primary content surface and phone surface.

--surface-2: oklch(94.7% 0.020 154)
Secondary surface, hover surface, inactive controls, and toggles.

--ink: oklch(22.4% 0.028 176)
Primary text, major headings, Falam words, and high-emphasis content.

--muted: oklch(52.4% 0.025 176)
Secondary text, descriptions, timestamps, labels, and supporting metadata.

--muted-2: oklch(68.0% 0.022 176)
Tertiary text, inactive icons, chevrons, and subtle metadata.

--line: oklch(86.5% 0.020 154)
Subtle dividers, input borders, and control borders.

--accent: oklch(43.2% 0.092 176)
Primary lake-teal accent for active navigation, search emphasis, buttons, badges, and key actions.

--accent-strong: oklch(36.5% 0.090 176)
Pressed and hover state for primary teal actions.

--accent-soft: oklch(89.0% 0.045 176)
Soft teal background for active tabs, language direction, badges, selected states, and empty-state symbols.

--peach: oklch(73.8% 0.102 46)
Warm accent for audio, pronunciation, saved/favorite feedback, status indicators, and small moments of warmth.

--peach-soft: oklch(91.5% 0.045 52)
Soft peach background for offline banners and audio-related feedback.

--danger: oklch(56.0% 0.140 28)
Use sparingly for errors and destructive actions.

--shadow: 0 26px 70px oklch(24% 0.030 176 / 0.13)
Use only for the large mobile preview shell or important elevated surfaces.

DARK THEME

--paper: oklch(15.4% 0.025 176)
Primary dark app background.

--paper-deep: oklch(18.4% 0.029 176)
Outer dark canvas and deeper background areas.

--surface: oklch(20.5% 0.032 176)
Primary dark content surface.

--surface-2: oklch(24.2% 0.036 176)
Higher dark surface, hover state, and secondary controls.

--ink: oklch(92.4% 0.018 154)
Primary dark-theme text.

--muted: oklch(71.0% 0.025 176)
Secondary dark-theme text.

--muted-2: oklch(57.0% 0.026 176)
Tertiary dark-theme text and inactive icons.

--line: oklch(31.5% 0.030 176)
Dark-theme dividers and borders.

--accent: oklch(73.8% 0.092 176)
Desaturated bright teal for dark-theme active states.

--accent-strong: oklch(82.0% 0.084 176)
Pressed and hover teal state in dark mode.

--accent-soft: oklch(28.5% 0.065 176)
Dark teal selected-state background.

--peach: oklch(78.0% 0.088 46)
Dark-theme warm accent.

--peach-soft: oklch(29.0% 0.045 52)
Dark-theme peach status background.

--shadow: 0 30px 74px oklch(4% 0.020 176 / 0.48)
Use sparingly in dark mode. Prefer surface-lightness differences for depth.

Never use pure black or pure white.

The accent should remain restrained. Most of the interface must remain neutral.

================================================== 4. TYPOGRAPHY TOKENS
==================================================

Use these font families:

UI font:
“DM Sans”, “Noto Sans”, system-ui, sans-serif

Linguistic text font:
“Noto Sans”, “DM Sans”, system-ui, sans-serif

Use Noto Sans or an equivalent Unicode-safe font for Falam words, pronunciation, diacritics, and examples.

Typography must prioritize readability, strong Unicode rendering, comfortable line height, and clear separation between Falam and English.

Base typography:

--font-size-body: 16px
--line-height-body: 1.5
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700

Small labels:

--font-size-xs: 0.70rem
--font-size-sm: 0.76rem
--font-size-meta: 0.72rem

Body and secondary UI:

--font-size-body: 1rem
--font-size-secondary: 0.84rem
--font-size-input: 0.96rem

Headings:

--font-size-section-label: 0.73rem
--font-size-page-title: 2rem
--font-size-greeting: 1.65rem
--font-size-result-title: 1.6rem
--font-size-definition: 1.15rem
--font-size-entry-word: clamp(2.3rem, 11vw, 3.4rem)

Typography rules:

Falam words use bold weight 700.
English meanings use regular or medium weight.
Pronunciation uses muted text and slightly increased letter spacing.
Part-of-speech labels use bold weight 700.
Use negative letter spacing only for large headings and Falam word display text.
Use text wrapping for all headings.
Use text-wrap: balance for headings.
Use text-wrap: pretty for longer descriptions.
Do not use gradient text.
Do not use all-caps for important language content.
Use uppercase only for small section labels with 0.12em letter spacing.
Keep body copy around 65ch to 75ch on larger layouts.

Hierarchy:

Falam word
↓
Pronunciation
↓
Part of speech
↓
English meaning
↓
Examples
↓
Related words
↓
Source and verification

================================================== 5. SPACING TOKENS
==================================================

Use a 4px spacing system:

--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
--space-24: 96px

Use spacing rhythm intentionally. Do not give every component identical padding.

Primary mobile horizontal padding:

24px on the mobile preview
20px on small screens

Search input height:

62px

Bottom navigation height:

86px

Minimum touch target:

44px

Preferred interactive target:

48px to 60px

Use gap instead of arbitrary sibling margins where possible.

================================================== 6. CORNER RADIUS TOKENS
==================================================

--radius-sm: 12px
--radius-md: 16px
--radius-lg: 22px
--radius-xl: 32px
--radius-phone: 42px
--radius-pill: 999px

Use:

42px for the phone shell
32px for large empty-state symbols
22px for major rounded surfaces
18px for search input
16px for compact controls
12px for small controls and badges
999px for chips, segmented controls, and audio buttons

Do not use excessive rounded cards for every piece of content.

================================================== 7. BORDER AND ELEVATION TOKENS
==================================================

Default border:

1px solid var(--line)

Focus border:

1px solid var(--accent)

Focus ring:

3px solid var(--peach)
3px offset

Use borders more often than shadows.

Use shadows only when elevation is necessary:

Large preview shell:
0 26px 70px oklch(24% 0.030 176 / 0.13)

Dark preview shell:
0 30px 74px oklch(4% 0.020 176 / 0.48)

Do not use heavy card shadows.
Do not use glassmorphism.
Do not use side-stripe accent borders.
Do not use decorative blur effects.

================================================== 8. ICON SYSTEM
==================================================

Use local inline SVG icons only. Do not depend on external icon libraries that may fail to load.

Every icon must remain visible if network access is unavailable.

Use a consistent outline icon style:

Stroke width: 1.8
Stroke linecap: round
Stroke linejoin: round
Viewbox: 0 0 24 24
No mixed icon families
No filled icons except where a selected favorite state needs a filled heart

Required icons:

Search
Heart
Clock
Grid or settings
Moon
Sun
Cloud-off
Wifi-off
Arrow-right
Arrow-left
Arrow-up-right
Chevron-right
Close
More-horizontal
Badge-check
Audio waveform

Icon sizes:

Small metadata icon: 15px
Small control icon: 16px
Standard icon: 19px
Navigation icon: 20px
Empty-state icon: 23px

Every icon button must have an accessible label.

Do not communicate important information through icons alone. Pair navigation icons with text labels.

================================================== 9. APP SHELL
==================================================

Create a mobile-first app shell.

Desktop preview:

A centered mobile phone shell on a muted outer canvas.
Optional design notes and token panel beside it.
The phone should be approximately 390px wide and 820px tall.
Use a 42px outer radius.
Use a subtle border and restrained shadow.

Mobile layout:

The phone fills the viewport.
Remove desktop-only side panels.
Remove outer radius and shadow on small screens.
Respect safe areas.
Keep the bottom navigation fixed within the app shell.

The main screen content should scroll independently above the bottom navigation.

================================================== 10. BOTTOM NAVIGATION
==================================================

Use four tabs:

Search
Favorites
History
More

Each tab must include:

A reliable local inline SVG icon
A visible text label
A minimum 44px touch target
A clear active state
An accessible aria-label
A hover state
A pressed state
A keyboard focus state

Navigation token behavior:

Inactive icon and label:
var(--muted-2)

Inactive hover:
var(--ink)
var(--paper) background

Active icon and label:
var(--accent)

Active background:
var(--accent-soft)

Active icon may move upward by 1px for subtle feedback.

Bottom navigation:

Position: fixed or absolute within the app shell
Height: 86px
Padding: 10px 13px 14px
Top border: 1px solid var(--line)
Background: var(--surface)
Grid: four equal columns
Gap: 6px
Radius of each tab: 15px

The active state must be obvious without relying on color alone. Use background, weight, icon, and label changes together.

================================================== 11. SEARCH HOME SCREEN
==================================================

Create the primary Search screen.

Top area:

App mark
“Falam Dictionary”
Friendly headline:
“Find the word you mean.”

Supporting text:
“A quick reference for Falam to English.”

Language direction control:

Falam
Arrow icon
English

Use a soft teal pill with a white or surface-colored inner swap control.

Search input:

Placeholder:
“Search a Falam word”

Height:
62px

Border radius:
18px

Background:
var(--paper)

Border:
1px solid var(--line)

Focused state:

Border becomes var(--accent)
Background becomes var(--surface)
Add a 4px soft accent focus halo

Search input must have:

Search icon
Clear button when text exists
Visible keyboard focus
Accessible label
Instant local-results behavior

Recent section:

Section label:
“Recent”

Clear action:
“Clear”

Recent rows must show:

Falam word
English meaning
Part of speech
Recent timestamp
Chevron or navigation affordance

Rows should use dividers and spacing rather than heavy cards.

Empty recent state:

“No recent words”
“Your recent searches will appear here.”

================================================== 12. ACTIVE SEARCH AND RESULTS
==================================================

When the user types a query, transition to a results state.

Display:

Back action labeled “Search”
Search query
Result count
Result list
Clear query action

Example:

“Falam word”
“12 results in the local dictionary”

Each result row should include:

Falam word
English meaning
Part of speech badge
Optional pronunciation
Favorite action where appropriate
Arrow or tap affordance

Rows should be compact but comfortable to scan.

Do not overuse filters. Only include filters if the dictionary data makes them genuinely useful.

No-results state:

“No results found”
“Try checking the spelling or searching another word.”

Include an optional action:

“Clear search”

================================================== 13. DICTIONARY ENTRY SCREEN
==================================================

Entry top bar:

Back action
Favorite button
More actions button

Entry header:

Large Falam word
Pronunciation
Part of speech
Native-speaker recording label
Audio button

The Falam word must be the most visually prominent element.

Example structure:

Falam word
/pronunciation/
noun

Listen in Falam

Content sections:

English meaning
Definition
Reviewed entry badge

Example
Falam example sentence
English translation

Additional meaning
Definition

Related words
Rounded chips

Source
Dictionary source
Pronunciation recording available

Use horizontal dividers and whitespace instead of excessive nested cards.

Audio button states:

Available:
Teal button
Waveform icon
“Listen in Falam”

Playing:
Peach button
Subtle waveform animation
“Playing in Falam”

Paused or stopped:
Return to available state

Downloading:
“Preparing audio”
Use a lightweight inline progress indicator

Unavailable offline:
Muted button
“Unavailable offline”

Never imply that Falam pronunciation is synthetic if it is a native-speaker recording.

For English pronunciation, label it as device or platform TTS.

Favorite states:

Inactive:
Outline heart
Muted color

Active:
Filled heart
Peach color

Pressed:
Subtle scale feedback

Saved state:
Immediate optimistic visual feedback

================================================== 14. FAVORITES SCREEN
==================================================

Title:

“Favorites”

Each saved row shows:

Falam word
English meaning
Part of speech
Saved date
Filled heart or remove action

Empty state:

“No saved words yet”
“Save useful words while browsing the dictionary.”

Use a simple empty-state symbol, not a large illustration.

================================================== 15. HISTORY SCREEN
==================================================

Title:

“History”

Group entries by:

Today
Yesterday

Each history row shows:

Falam word
English meaning
Time or date
Chevron

Include:

“Clear all”

After clearing:

Change the action to “Cleared” temporarily.
Use muted text.
Do not show a disruptive modal.

Empty state:

“No recent words”
“Your recent searches will appear here.”

================================================== 16. MORE AND SETTINGS SCREEN
==================================================

Title:

“More”

Sections:

Appearance
Language
Audio
Data
About

Appearance:

Theme
System
Light
Dark

Use a segmented control:

System
Light
Dark

Active segment:

var(--surface)
var(--accent)
Subtle shadow
Bold text

Language:

Dictionary direction
Falam to English

Audio:

English pronunciation
Use device voice

Falam recordings
Native-speaker audio when available

Use accessible on/off toggles.

Data:

Dictionary information
Sources
Verification information

About:

About Falam Dictionary
Version
Credits

Avoid overloading this screen.

================================================== 17. OFFLINE EXPERIENCE
==================================================

The app is offline-first.

When offline, show a small non-blocking banner:

“Offline mode”
“Local dictionary is ready. Remote audio may be unavailable.”

Use:

Background: var(--peach-soft)
Icon: wifi-off
Border: subtle peach-tinted border
Text: var(--ink)
Supporting text: var(--muted)

The banner should appear above the bottom navigation without covering important content.

Local search must continue to work offline.

Downloaded audio should play immediately.

Undownloaded remote audio should show:

“Unavailable offline”
or
“Download when online”

Do not show a full-screen offline error for normal local search.

================================================== 18. EMPTY, LOADING, AND ERROR STATES
==================================================

No search query:

“Search a Falam word”
“Start with a word you want to understand.”

No results:

“No results found”
“Try checking the spelling or searching another word.”

No favorites:

“No saved words yet”
“Save useful words while browsing the dictionary.”

No history:

“Your recent searches will appear here.”

Loading:

Use lightweight skeleton rows.
Do not use a full-screen spinner for local dictionary actions.
Avoid making instant local content feel slow.

Audio error:

“Audio couldn’t be played”
“Try again or check your connection.”

Database error:

“Dictionary unavailable”
“Try reopening the app or checking the downloaded dictionary.”

Corrupted data:

“Dictionary data needs attention”
“Download a fresh dictionary file to continue.”

Keep error language human and actionable. Never show raw technical error messages.

================================================== 19. INTERACTION STATES
==================================================

Design the following states for all important controls:

Default
Hover
Focus
Pressed
Active
Disabled
Loading
Success
Error

Search field:

Default
Focused
Typing
Has results
No results
Cleared

Favorite:

Inactive
Active
Pressed
Saved
Removed

Audio:

Available
Playing
Paused
Stopped
Downloading
Unavailable offline
Failed

Network:

Online
Offline
Reconnecting
Audio unavailable

Navigation:

Inactive
Hover
Focused
Pressed
Active

Use optimistic updates for favorites and other low-risk actions.

================================================== 20. MOTION TOKENS
==================================================

Use subtle motion only.

Motion must feel fast and natural.

Do not use bouncing, elastic, decorative, or distracting animations.

Use transform and opacity wherever possible.

Easing:

--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--ease-in: cubic-bezier(0.7, 0, 0.84, 0)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)

Durations:

Micro feedback:
100ms to 150ms

State change:
200ms to 300ms

Layout change:
300ms to 500ms

Entrance:
500ms to 800ms

Examples:

Search focus transition
Result appearance
Favorite feedback
Audio waveform
Navigation transition
Offline banner entrance
Theme transition

Respect prefers-reduced-motion.

================================================== 21. ACCESSIBILITY
==================================================

Use:

Minimum 16px body text
Strong contrast
44px minimum touch targets
Clear focus rings
Accessible labels for icon buttons
Visible text labels for navigation
Keyboard-friendly controls
Readable line heights
Accessible audio button labels
Clear active and inactive states
Wrapping instead of ambiguous truncation
Support for larger text sizes
Do not communicate meaning through color alone

Every icon-only control must have an accessible aria-label.

Use semantic HTML structure.

Ensure the interface remains usable with:

Large text
Small screens
Keyboard navigation
Screen readers
Long Falam words
Long English definitions
Multiline examples
Offline mode

================================================== 22. RESPONSIVE BEHAVIOR
==================================================

Design primarily for mobile portrait screens.

Support:

320px wide small screens
360px wide phones
390px wide phones
430px wide phones
Large phones
Tablet-width previews

At smaller widths:

Reduce horizontal padding to 20px.
Keep body text at least 16px.
Allow Falam words to wrap.
Keep bottom navigation labels visible.
Never compress icons below 18px.
Avoid horizontal scrolling.

At larger widths:

Keep the mobile app shell centered.
Allow design notes or token documentation outside the shell.
Do not turn the app into a desktop dashboard.

Respect safe-area insets around the bottom navigation.

================================================== 23. COMPONENT INVENTORY
==================================================

Create reusable components for:

App mark
Top app bar
Back button
Bottom navigation
Search input
Clear search button
Language direction pill
Recent word row
Search result row
Dictionary word header
Pronunciation label
Audio button
Audio waveform
Favorite button
More actions button
Part-of-speech badge
Definition section
Example block
Related-word chip
Verification badge
Source metadata
Offline banner
Toggle
Segmented theme control
Empty state
Loading skeleton
Error state
No-results state
History group
Settings row

Keep spacing, icons, typography, borders, radii, and interaction states consistent across all components.

================================================== 24. DESIGN QUALITY RULES
==================================================

The final design must not look AI-generated.

Avoid:

Identical card grids
Random gradients
Generic blue SaaS styling
Overuse of purple
Excessive glassmorphism
Oversized decorative illustrations
Huge hero metrics
Dense card nesting
Random icon styles
Tiny touch targets
External icon dependencies
Fake Falam content
Unclear navigation
Invisible active states
Full-screen loading for small actions

Use hierarchy through:

Typography
Weight
Position
Spacing
Color contrast
Dividers
Intentional alignment

The final visual center of every screen must be the Falam language and its English meaning.

================================================== 25. FINAL DELIVERABLE
==================================================

Create a complete high-fidelity mobile UI prototype containing:

Search home
Active query
Search results
Dictionary entry
Multiple meanings
Favorites
Favorites empty state
History
History empty state
More/settings
Audio playing state
Audio unavailable state
Offline state
No-results state
Loading state
Error state
Light mode
Dark mode

All icons must be reliable local inline SVGs.

All interactions must be functional in the prototype:

Search
Clear search
Open result
Open dictionary entry
Save and unsave favorite
Play audio state
Toggle offline mode
Toggle dark mode
Switch tabs
Clear recent items
Clear history
Toggle settings

Use only clearly labeled prototype dictionary content. Do not invent real Falam vocabulary.

The final product should feel like a trustworthy, modern, simple way to explore the Falam language.
