# Yuei.AI

Yuei.AI is an interactive music training platform focused on developing practical music-reading and ear-training skills.

## Build Process

Yuei.AI was built as a modular Next.js application, with shared infrastructure for music notation, audio, and training sessions. Currently has trainers for  4-star RCM.

VexFlow handles musical notation, Tone.js handles audio, and reusable React components power the interactive keyboards and controls. Each training module contains its own music theory and exercise logic while sharing the same core training system.

Note Identification tries to replicate "Music Tutor", a popular app with similar functionality, where there is configurable clef, range, accidentals and more.

The interface was built responsively with keyboard and touch support, with type checking, testing, and production builds used throughout development.


## Training Modules

### Interval Training

Identify musical intervals through ascending, descending, and harmonic exercises.

**Status:** Ready

### Note Identification

Identify notes displayed on treble and bass clefs using an interactive piano keyboard.

Features include:

* Treble and bass clefs
* Customizable note ranges
* Natural, sharp, and flat notes
* Optional note audio
* Timed and unlimited sessions
* Keyboard note labels

**Status:** Ready

### Chord Identification

A planned module for identifying musical chords by ear.

**Status:** Coming soon

## Tech Stack

* Next.js
* React
* TypeScript
* Tone.js
* VexFlow
* CSS

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Routes

| Route                   | Module               |
| ----------------------- | -------------------- |
| `/`                     | Training Home        |
| `/interval`             | Interval Training    |
| `/note-identification`  | Note Identification  |
| `/chord-identification` | Chord Identification |
