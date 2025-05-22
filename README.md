# Interval Timer App

This project is a simple, user-friendly interval timer designed for various activities like workouts, study sessions (e.g., Pomodoro Technique), or any task requiring timed intervals with auditory and visual cues.

## Project Overview

The application provides a stopwatch with the ability to set custom intervals. When the stopwatch is running, it will emit a beep sound and provide visual feedback at each specified interval.

**Key Features:**

*   **Standard Stopwatch Controls:** Start, stop, and reset the timer.
*   **Customizable Interval Beeping:** Users can define an interval in seconds. The app will beep and provide a visual cue each time this interval elapses while the stopwatch is running.
*   **Visual Feedback:** The timer display pulses when an interval beep occurs.
*   **Screen Wake Lock:** The application attempts to keep the device's screen awake while the timer is active to prevent interruptions. A visual indicator shows the status of the wake lock.
*   **Audio Initialization:** On some browsers, user interaction (clicking a button) is required to enable audio playback. The app provides an "Initialize Audio" button for this purpose.

**Technology Stack:**

*   React
*   TypeScript
*   Vite
*   Tailwind CSS
*   shadcn-ui (for UI components)

## Usage Notes

*   **Interval Setting:** The interval for beeps is set in seconds. You can input a number directly or use simple mathematical expressions (e.g., `1.5*60` for 90 seconds).
*   **Audio:** Ensure your device's volume is up to hear the beeps. If you don't hear sounds initially, click the "Initialize Audio" button.
*   **Screen Wake Lock:** While the app attempts to keep the screen on, browser support for the Wake Lock API can vary. An indicator will show if the feature is active.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ddbfb465-c190-498f-8701-3efd2b204643) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ddbfb465-c190-498f-8701-3efd2b204643) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
