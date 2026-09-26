# OneZoo Broadcast System Architecture

## System Layers

### Layer 1: AI Keeper Avatar System

The avatar is the intelligent personality of the stream.

```
┌─────────────────────────────────┐
│   AVATAR KNOWLEDGE BASE         │
│  (Supabase onezoo_animals)      │
├─────────────────────────────────┤
│  ✓ Animal Profile               │
│  ✓ Learned Behaviors            │
│  ✓ Fun Facts Library            │
│  ✓ Feeding Schedule             │
│  ✓ Active Hours Pattern        │
│  ✓ Conservation Status          │
└─────────────────────────────────┘
           ↓ (loaded at stream start)
┌─────────────────────────────────┐
│   ANTHROPIC CLAUDE API          │
│  (avatar-commentary function)   │
├─────────────────────────────────┤
│  ✓ Ambient Commentary Gen       │
│  ✓ Behavior Triggered Response  │
│  ✓ Viewer Question Answering    │
│  ✓ Interaction Responses        │
│  ✓ Rare Moment Commentary       │
└─────────────────────────────────┘
           ↓ (real-time)
┌─────────────────────────────────┐
│   AVATAR CHAT PANEL             │
│  (on-screen chat interface)     │
├─────────────────────────────────┤
│  ✓ Typewriter effect display    │
│  ✓ Viewer question input        │
│  ✓ Message history              │
│  ✓ Avatar status indicator      │
└─────────────────────────────────┘
```

### Layer 2: BTL Broadcast Package

Professional sports broadcast overlays adapted for wildlife.

```
BROADCAST OVERLAYS
├─ Score Bug (top-left)
│  ├─ Animal name
│  ├─ Time active
│  ├─ Current mood
│  └─ Live viewer count
│
├─ Activity Meter (bottom-left)
│  ├─ REST ←→ ACTIVE scale
│  └─ Current activity level
│
├─ Stat Line (bottom-right)
│  ├─ Feeding events today
│  ├─ Rare behaviors logged
│  ├─ Treats received
│  └─ Conservation milestone
│
├─ Rare Moment Overlay (full screen)
│  ├─ Alert banner
│  ├─ Moment description
│  ├─ Viewer count
│  └─ Clip/Share buttons
│
└─ Conservation Tracker (right side)
   ├─ Today's fundraising
   ├─ Total raised
   ├─ Trees planted
   └─ Wild population stats
```

### Layer 3: Viral Moment System

Keepers trigger moments that drive viewer engagement.

```
KEEPER TRIGGERS MOMENT
        ↓
┌──────────────────────┐
│  Moment Type:        │
│  ✓ Rare Behavior     │
│  ✓ Cute Moment       │
│  ✓ Feeding Time      │
│  ✓ Playful Mode      │
│  ✓ Surprise Event    │
└──────────────────────┘
        ↓
┌──────────────────────────────────┐
│  ALERTS & NOTIFICATIONS          │
├──────────────────────────────────┤
│  ✓ Full-screen overlay           │
│  ✓ Push notifications (subscribed)│
│  ✓ Avatar special commentary     │
│  ✓ Clip capture button           │
└──────────────────────────────────┘
        ↓
┌──────────────────────────────────┐
│  VIRAL MECHANICS                 │
├──────────────────────────────────┤
│  ✓ Clip counter shows trending   │
│  ✓ Share button for social       │
│  ✓ OneZoo branding on clip       │
│  ✓ Top clips auto-posted         │
└──────────────────────────────────┘
```

## Data Architecture

### Stream Session Lifecycle

```
STREAM START
    ↓
┌─────────────────────────────────┐
│  onezoo_stream_sessions         │
│  Create new session record      │
│  - animal_id                    │
│  - started_at                   │
│  - status: "active"             │
└─────────────────────────────────┘
    ↓
STREAM LIVE
    ├─ onezoo_avatar_messages (commentary)
    ├─ onezoo_interactions (treats/donations)
    ├─ onezoo_rare_moments (triggered events)
    └─ Update peak_viewers, total_interactions
    ↓
STREAM END
    ↓
┌─────────────────────────────────┐
│  onezoo_stream_sessions         │
│  - ended_at = now()             │
│  - status: "completed"          │
│  - Calculate conservation_donated│
│  - Generate recap data          │
└─────────────────────────────────┘
```

### Real-Time Data Flow

```
┌─────────────┐
│   STREAM    │
└──────┬──────┘
       │
       ├─→ Avatar Observable
       │   ├─ Time elapsed
       │   ├─ Probable activity
       │   ├─ Behavior patterns
       │   └─ Schedule position
       │
       ├─→ Keeper Actions
       │   └─ Trigger moments
       │
       ├─→ Viewer Interactions
       │   ├─ Send treats
       │   ├─ Ask questions
       │   └─ Join/leave
       │
       └─→ System Events
           ├─ Peak viewer alerts
           ├─ Rare behavior detection
           └─ Milestone achievements
```

## API Contracts

### Avatar Commentary Edge Function

**Request**:
```typescript
{
  animalId: string;           // UUID of animal
  animalName: string;         // Display name
  avatarName: string;         // Keeper/avatar name
  userMessage?: string;       // For response type
  messageType: 'ambient'      // Type of commentary
              | 'behavior'    // Animal did something
              | 'interaction' // Viewer interaction
              | 'rare'        // Special moment
              | 'response';   // Answer question
  behaviorDetected?: string;  // What animal did
  currentActivity?: string;   // Stream context
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;           // Avatar commentary (max 150 chars)
  error?: string;           // If failed
}
```

### Chat Message Flow

```
Viewer Types Message
    ↓
AvatarChatPanel captures input
    ↓
POST /functions/v1/avatar-commentary
    (messageType: 'response')
    ↓
Claude generates contextual answer
    ↓
Display in chat with avatar name
    ↓
Log to onezoo_avatar_messages table
    ↓
Update UI with likes/reactions
```

### Moment Trigger Flow

```
Keeper clicks "Trigger Moment"
    ↓
KeeperMomentTrigger component
    ├─ Validate moment type
    ├─ Capture description
    └─ Call handler
    ↓
INSERT into onezoo_rare_moments
    ├─ moment_type
    ├─ keeper_description
    └─ viewers_present count
    ↓
Emit onMomentTriggered event
    ↓
RareMomentOverlay appears
    ├─ Full screen
    ├─ 6 second duration
    ├─ Auto-dismiss
    └─ Show clip button
    ↓
Notify subscribers
Update clip counter
```

## Component Communication

```
┌─────────────────────────────────┐
│        BroadcastPlayer          │ (Main container)
├─────────────────────────────────┤
│                                 │
│  ┌─────────┬──────────────────┐ │
│  │  Video  │  AvatarChatPanel │ │
│  │  Stream │  ┌────────────┐  │ │
│  │         │  │ Avatar     │  │ │
│  │         │  │ Messages   │  │ │
│  │         │  │ ┌────────┐ │  │ │
│  │         │  │ │Question│ │  │ │
│  │         │  │ │Input   │ │  │ │
│  │         │  └────────────┘  │ │
│  │ Overlays:                   │ │
│  │ - BroadcastScoreBug         │ │
│  │ - ActivityMeter             │ │
│  │ - StatLine                  │ │
│  │ - ConservationTracker       │ │
│  │ - RareMomentOverlay         │ │
│  │                             │ │
│  │ Tools (Keeper View):        │ │
│  │ - KeeperMomentTrigger       │ │
│  └─────────┴──────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## State Management

### Local State (React Hooks)

```
BroadcastPlayer
├─ isLive (boolean)
├─ timeActive (string)
├─ viewerCount (number)
├─ activityLevel (number: 0-100)
├─ feedingEvents (number)
├─ rareBehaviors (number)
├─ treatCount (number)
├─ conservationMilestone (string)
└─ rareMoment (object)
   ├─ isActive
   ├─ type
   ├─ name
   └─ description

AvatarChatPanel
├─ messages (array)
├─ inputValue (string)
├─ loading (boolean)
├─ avatarStatus (enum)
└─ messagesEndRef (ref)

ConservationTracker
└─ isCollapsed (boolean)
```

### Server State (Supabase)

```
onezoo_animals
├─ knowledge_base (JSONB)
├─ behavior_patterns (JSONB)
├─ feeding_schedule (JSONB)
└─ typical_active_hours (int[])

onezoo_stream_sessions
├─ peak_viewers
├─ total_interactions
├─ treats_received
├─ rare_moments_count
├─ revenue_generated
├─ conservation_donated
└─ clips_created

onezoo_avatar_messages
├─ message_type
├─ message
├─ viewer_reaction
└─ likes

onezoo_rare_moments
├─ moment_type
├─ keeper_description
├─ avatar_commentary
├─ viewers_present
└─ clips_created
```

## Performance Optimizations

1. **Edge Function Caching**: Commentary cached for identical prompts
2. **Database Indexing**: All frequently queried fields indexed
3. **React Optimization**: Memoization on overlay components
4. **CSS Animations**: GPU-accelerated transitions
5. **Lazy Loading**: Components load as needed
6. **Message Batching**: Overlays update on 5-second intervals
7. **Image Optimization**: Stream image resized by CDN

## Security Model

### Row Level Security

```
onezoo_animals
└─ Public read for active animals
└─ Zoo staff update only their animals

onezoo_stream_sessions
└─ Public read (all sessions visible)
└─ Zoo staff create/update their sessions

onezoo_avatar_messages
└─ Public read (all messages visible)
└─ System insert only

onezoo_interactions
└─ Public read (transparent about donations)
└─ Authenticated users can interact

onezoo_rare_moments
└─ Public read (show what happened)
└─ Zoo staff create only

onezoo_viewer_profiles
└─ Users see own profile
└─ Users update own profile

onezoo_conservation_tracker
└─ Public read (transparency)
└─ Zoo staff update only
```

### API Security

- Edge functions verify JWT for protected operations
- Rate limiting on avatar commentary endpoint
- Input sanitization on keeper descriptions
- No sensitive keeper data exposed to viewers

## Scalability

The system is designed to scale:

- **Database**: Partitioned by animal_id and session_id
- **Edge Functions**: Automatically scale with Supabase
- **Frontend**: Virtualizes message lists for 1000s of messages
- **Storage**: Clips stored in Supabase Storage with CDN
- **Analytics**: Aggregated reports generated async

## Extension Points

### Adding New Avatar Personalities

Add to `momentTypes` in `KeeperMomentTrigger.tsx`:
```typescript
yourPersonality: {
  icon: <YourIcon />,
  label: 'Your Label',
  color: 'gradient classes',
  description: 'Your description',
}
```

### Adding New Commentary Types

Update `generateCommentary()` in edge function with new `messageType` case.

### Custom Overlays

Create new overlay component matching `BroadcastScoreBug` pattern and mount in `BroadcastPlayer`.

### Animal-Specific Behaviors

Add to knowledge base in `AvatarKnowledgeBuilder` - system learns over time.

## Monitoring

### Key Metrics to Track

- Avatar response latency (target: <2s)
- Message success rate (target: 99%+)
- Rare moment engagement (% of viewers who clip)
- Conservation donation conversion ($ raised/viewer)
- Chat message volume (messages/hour during stream)
- Peak viewer correlation with moments (moments → viewers)

## Future Enhancements

1. **Voice Avatar**: Text-to-speech with animal-specific voices
2. **Visual Recognition**: Real-time behavior detection via Gemini Vision
3. **Predictive Analytics**: Forecast peak activity times
4. **Multi-Language**: Avatar commentary in multiple languages
5. **AR Experience**: Mobile AR overlay for viewer phones
6. **Live Betting**: Prediction games on behavior
7. **Merchandise**: Avatar-branded products tied to moments
8. **Educational Curriculum**: Align commentary with K-12 standards

---

This architecture proves BTL's broadcast system is truly media-agnostic and works for:
- Sports (basketball, football, etc.)
- Wildlife (OneZoo)
- News broadcasts
- Entertainment streams
- Educational content
- Live events of any type
