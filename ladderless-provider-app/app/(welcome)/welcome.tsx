/**
 * @file welcome.tsx
 * @location app/(welcome)/welcome.tsx
 * @description
 * Route entry point for the temporary beta welcome screen.
 * 
 * Uses the feature module from src/features/welcome to keep the
 * modular monolith structure clean and consistent with the rest of the app.
 */

import { WelcomeScreen } from '@/features/welcome';

export default WelcomeScreen;
