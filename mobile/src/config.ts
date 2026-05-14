/**
 * mobile/src/config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * API base URL configuration.
 *
 * HOW TO CONNECT TO YOUR BACKEND FROM DIFFERENT DEVICES:
 *
 *  • Android Emulator  → use "http://10.0.2.2:8000"
 *    (10.0.2.2 is a special alias that maps to your dev machine's localhost)
 *
 *  • Physical Phone    → use "http://YOUR_LAN_IP:8000"
 *    Find your IP with:  ip route get 1 | awk '{print $7}'
 *    Example:  "http://192.168.1.42:8000"
 *
 *  • Expo Web          → use "http://localhost:8000"
 *
 * Change API_BASE_URL below to match your setup.
 */

// ← Change this to your machine's LAN IP when testing on a physical device
// export const API_BASE_URL = "http://192.168.1.42:8000";

// Android emulator
// export const API_BASE_URL = "http://10.0.2.2:8000";

// ✅ Your machine's current LAN IP (auto-detected)
export const API_BASE_URL = "http://10.62.149.249:8000";
