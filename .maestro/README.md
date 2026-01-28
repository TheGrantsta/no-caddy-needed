# Maestro Screenshot Automation

This folder contains Maestro flows for automated screenshot generation.

## Prerequisites

1. Install Maestro:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. Add to PATH (add to ~/.zshrc):
   ```bash
   export PATH=$PATH:$HOME/.maestro/bin
   ```

3. Build a development client:
   ```bash
   # For iOS Simulator
   npx expo run:ios

   # For Android Emulator
   npx expo run:android
   ```

## Running Screenshots

1. Start the emulator/simulator with the dev build running

2. Run the screenshot flow:
   ```bash
   # From project root
   maestro test .maestro/screenshots.yaml
   ```

3. Screenshots will be saved to `.maestro/screenshots/`

## Google Play Requirements

- Phone screenshots: 2-8 images
- Dimensions: 16:9 or 9:16 aspect ratio
- Min: 320px, Max: 3840px per side
- PNG or JPEG format

## Customizing

Edit `screenshots.yaml` to modify which screens are captured or add new flows.
