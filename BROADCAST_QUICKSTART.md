# OneZoo Broadcast System - Quick Start Guide

## For Zoo Staff: How to Use

### Step 1: Access Broadcast Dashboard

1. Go to OneZoo website
2. Click "Live Broadcast" button (red button with pulsing dot in header)
3. Broadcast player opens full-screen

### Step 2: Build Your Animal's Avatar

1. From admin area, click "Avatar Knowledge Builder"
2. Fill in animal profile:
   - Name: "Bao Bao"
   - Species: "Giant Panda"
   - Age: 12
   - Avatar Emoji: 🐼
   - Avatar Name: "Keeper Maya"
   - Personality: "Enthusiastic Educator"

3. Click "Behaviors" tab:
   - Add behaviors you see: "pacing", "eating bamboo", "playing"
   - Describe what they look like and what they mean
   - Set frequency and time of day

4. Click "Facts" tab:
   - Add fun facts about your animal
   - These make the avatar personable

5. Click "Schedule" tab:
   - Add feeding times
   - Select active hours of the day

6. Save - Avatar is now live!

### Step 3: Stream Live

During your broadcast:

- **Avatar Chats Automatically**: Generates commentary every 90 seconds
- **Answer Viewer Questions**: Type in chat panel, avatar responds
- **Trigger Special Moments**: Click moment type (rare, cute, feeding, playful)
  - Describe what's happening
  - Full-screen alert goes to all viewers
  - Moment is clipped and shareable
- **Watch Live Stats**: Score bug, activity meter, and conservation tracker update in real-time

### Step 4: After Stream

Recap card auto-generates with:
- Stream duration and peak viewers
- Top contributor leaderboards
- Highlight moments captured
- Conservation impact
- Social media shares

---

## For Viewers: How to Experience

### Watch the Stream

1. Click "Live Broadcast" button in header
2. Full-screen broadcast player opens
3. Watch stream with overlays:
   - **Score Bug** (top-left): Animal name, mood, viewer count
   - **Activity Meter** (bottom-left): Is the animal active?
   - **Stat Line** (bottom-right): Today's feeding events, treats given
   - **Chat Panel** (right): Keeper's avatar talking and answering questions

### Interact

- **Send Treats**: Click treat button (costs coins)
  - Avatar responds with excitement
  - Donation credited to conservation
- **Ask Questions**: Type in chat, avatar answers in 2 seconds
- **Clip Moments**: When "RARE MOMENT" alert appears, clip it
  - Save to your collection
  - Share on social media
- **Track Conservation**: Check conservation panel
  - See how much you've donated
  - Track species population trends

---

## Technical Quick Reference

### Database Tables

| Table | Purpose |
|-------|---------|
| `onezoo_animals` | Animal profiles + avatar knowledge base |
| `onezoo_stream_sessions` | Stream stats and performance data |
| `onezoo_avatar_messages` | All generated commentary |
| `onezoo_interactions` | Treats, donations, engagement |
| `onezoo_rare_moments` | Viral moment tracking |
| `onezoo_viewer_profiles` | User engagement tracking |
| `onezoo_conservation_tracker` | Conservation impact monthly |

### Key Components

| Component | What It Does |
|-----------|--------------|
| `AvatarChatPanel` | Displays avatar messages and chat input |
| `BroadcastScoreBug` | Shows score bug with live stats |
| `BroadcastOverlay` | Activity meter and stat line |
| `RareMomentOverlay` | Full-screen rare moment alerts |
| `ConservationTracker` | Fundraising and impact panel |
| `KeeperMomentTrigger` | Keeper tool to trigger moments |
| `BroadcastPlayer` | Main broadcast player container |

### API Endpoint

**POST** `/functions/v1/avatar-commentary`

Generate avatar commentary via Claude:
- Ambient: Describe what animal likely doing
- Behavior: Animal detected doing something
- Interaction: Viewer sent treat
- Rare: Special moment happening
- Response: Answer viewer question

---

## Common Workflows

### Create Stream Avatar

```
Header (Manage Feeds) → AdminModal
  → Avatar Knowledge Builder
  → Fill tabs
  → Save
```

### Watch Live Stream

```
Header (Live Broadcast)
  → BroadcastPlayer opens
  → Watch stream + overlays
  → Read avatar commentary
  → Send treats/ask questions
```

### Trigger Rare Moment

```
During stream:
1. Keeper notices rare behavior
2. Click "Trigger Moment" panel
3. Select moment type
4. Describe what's happening
5. Submit
6. Full-screen alert appears
7. Viewers can clip it
```

### View Recap

```
Stream ends
→ RecapCard auto-generates
→ Shows stats, highlights, top contributors
→ Can share or download
```

---

## Customization

### Change Avatar Personality

In `AvatarKnowledgeBuilder`, select:
- **Enthusiastic Educator** - Exclamation points, loves the animal
- **Calm Scientist** - Formal, data-driven, educational
- **Playful Storyteller** - Narrative, entertaining, engaging
- **Formal Researcher** - Academic, references studies

Each personality generates different commentary style but uses same knowledge base.

### Add New Behaviors

During stream prep, open Knowledge Builder:
1. Click "Behaviors" tab
2. Add new behavior the animal does
3. Describe it and what it means
4. Avatar learns over time

### Custom Facts

Every time you add a fun fact, avatar has that information for future conversations. Build knowledge base over many streams.

---

## Troubleshooting

### Avatar Not Responding

- Check internet connection
- Ensure ANTHROPIC_API_KEY configured in Supabase
- Check edge function logs

### Chat Messages Not Appearing

- Refresh page
- Check that stream is marked as "live"
- Ensure avatar status is not "away"

### Overlays Misaligned

- Check viewport size
- Components are responsive but need minimum width
- Try fullscreen

### Moments Not Triggering

- Ensure you're in keeper view
- Validate moment description entered
- Check database insert permissions

---

## Keyboard Shortcuts (Coming Soon)

- `B` - Open Broadcast
- `T` - Trigger Moment
- `C` - Clip Stream
- `Esc` - Close Broadcast

---

## Statistics & Analytics

During stream, track:

- **Viewer Engagement**: Moment count + clip shares
- **Avatar Performance**: Message response rate
- **Conservation Impact**: $ raised and donations processed
- **Popular Moments**: Most clipped behaviors

After stream, analytics show:
- Peak viewer times
- Moment engagement rates
- Conversion (viewers → donors)
- Top performing behaviors

---

## Support

### For Zoo Staff
- Email: zookeeper@onezoo.com
- Section: "Broadcast System Questions"
- Include: Animal name, issue description

### For Viewers
- In-app help: Bottom of broadcast player
- Report issues with moment trigger
- Suggest enhancements

---

## Version Info

- **System**: OneZoo AI Avatar + BTL Broadcast Package
- **Version**: 1.0
- **Released**: 2026
- **Last Updated**: April 2026

---

**You're ready to broadcast!** 🎬

Create your animal's avatar, go live, engage viewers, and make conservation impact with OneZoo's AI-powered broadcast system.
