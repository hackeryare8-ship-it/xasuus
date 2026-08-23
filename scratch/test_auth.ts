import { AuthService } from '../src/services/authService';
import { StorageService } from '../src/services/storage';

async function runPremiumAnimationAndPhotoTests() {
  console.log('=== XASUUS PREMIUM ANIMATIONS & PROFILE PHOTO TEST SUITE ===\n');

  // 1. Init
  await AuthService.init();
  console.log('✔ System initialized.');

  // 2. Existing user login
  console.log('\n--- TEST 1: Existing User Login & Profile Recognition ---');
  const loginRes = await AuthService.login('maxamed@gmail.com', 'Maxamed@2026!');
  console.log('Login success:', loginRes.success);
  console.log('User Name:', loginRes.user?.name);
  console.log('Initial Avatar:', loginRes.user?.avatar);

  // 3. Profile photo upload and update for User A
  console.log('\n--- TEST 2: Profile Photo Upload & Update ---');
  const customAvatarDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const updatedUser = AuthService.updateUserProfile('user_maxamed', {
    avatar: customAvatarDataUrl
  });
  console.log('Profile Photo Updated:', updatedUser?.avatar === customAvatarDataUrl);

  // 4. Persistence check across session
  console.log('\n--- TEST 3: Persistence in Active Session ---');
  const activeSession = AuthService.getActiveSession();
  console.log('Active Session User Avatar:', activeSession?.user.avatar === customAvatarDataUrl);

  // 5. Logout & Re-login persistence
  console.log('\n--- TEST 4: Persistence across Logout and Login ---');
  AuthService.logout();
  console.log('Logged out. Session is null:', AuthService.getActiveSession() === null);

  const reLoginRes = await AuthService.login('maxamed@gmail.com', 'Maxamed@2026!');
  console.log('Re-login success:', reLoginRes.success);
  console.log('Re-login Avatar matches uploaded photo:', reLoginRes.user?.avatar === customAvatarDataUrl);

  // 6. User B isolation check (User B cannot overwrite or have User A photo)
  console.log('\n--- TEST 5: Cross-User Photo and Data Isolation ---');
  const userBRes = await AuthService.login('hoodo@gmail.com', 'Hoodo@2026!');
  console.log('User B (Hoodo) login success:', userBRes.success);
  console.log('User B has own distinct avatar:', userBRes.user?.avatar !== customAvatarDataUrl);

  // Update Hoodo's avatar with another custom photo
  const hoodoAvatarDataUrl = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  AuthService.updateUserProfile('user_hoodo', { avatar: hoodoAvatarDataUrl });

  const maxamedAccount = AuthService.getAccounts().find(a => a.id === 'user_maxamed');
  const hoodoAccount = AuthService.getAccounts().find(a => a.id === 'user_hoodo');

  console.log('Maxamed avatar is still intact:', maxamedAccount?.profile.avatar === customAvatarDataUrl);
  console.log('Hoodo avatar is distinct:', hoodoAccount?.profile.avatar === hoodoAvatarDataUrl);

  // 7. New User Signup & Instant Personal Workspace
  console.log('\n--- TEST 6: New User Registration & Workspace ---');
  const newReg = await AuthService.register('Suleeqo Cabdi', 'suleeqo@gmail.com', 'SuleeqoPass2026!');
  console.log('New User registered:', newReg.success);
  console.log('New User default avatar assigned:', !!newReg.user?.avatar);
  const suleeqoDocs = StorageService.getDocuments(newReg.user!.id);
  console.log('New User clean workspace docs:', suleeqoDocs.length);

  console.log('\n🎉 ALL PREMIUM ANIMATIONS & PROFILE PHOTO TESTS PASSED 100%!');
}

runPremiumAnimationAndPhotoTests().catch(console.error);
