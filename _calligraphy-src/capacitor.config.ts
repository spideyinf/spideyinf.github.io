import type { CapacitorConfig } from '@capacitor/cli'

// The iOS and Android apps wrap the same web app. Build it with
// `npm run build:app`, then `npx cap add ios` / `npx cap add android` once,
// and `npm run cap:sync` after each change. Daily reminders there are native
// local notifications (src/lib/notify.ts), delivered on time with the app closed.
const config: CapacitorConfig = {
  appId: 'io.github.spideyinf.writingtolearn',
  appName: 'Writing to Learn',
  webDir: 'dist-app',
  backgroundColor: '#FBF6EA',
  plugins: {
    LocalNotifications: {
      // Android status-bar icon: add res/drawable/ic_stat_nib.png in the Android project.
      smallIcon: 'ic_stat_nib',
      iconColor: '#1E3A5F',
    },
  },
}

export default config
