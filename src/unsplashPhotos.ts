/**
 * Background photos from Unsplash, keyed by the image file in public/. Each credit links to the photographer's profile
 * and to the photo's own page, as Unsplash's attribution guideline asks.
 */
export const unsplashPhotos = {
  "welcome": { id: "h2O_jHvjfIM", name: "Joanna Kosinska", username: "joannakosinska" },
  "party-background": { id: "78uNJt1kPw8", name: "Joanna Kosinska", username: "joannakosinska" },
  "login-garage-door": { id: "k0nfntv2Dgs", name: "Call Me Fred", username: "callmefred" },
  "party-garage-door-3": { id: "24JJStvqFLs", name: "Nicole Baster", username: "nicolebaster" },
  "enter-background": { id: "lNUQnuhqnLQ", name: "Annie Spratt", username: "anniespratt" },
  "not-found": { id: "Yj1M5riCKk4", name: "NASA", username: "nasa" },
  "pagebg": { id: "kFbSKhukfIQ", name: "Erin McKenna", username: "epw615" },
} as const;

export type UnsplashPhoto = keyof typeof unsplashPhotos;

const referral = "utm_source=gnomik.me&utm_medium=referral";

export const unsplashProfileUrl = (username: string) => `https://unsplash.com/@${username}?${referral}`;

export const unsplashPhotoUrl = (id: string) => `https://unsplash.com/photos/${id}?${referral}`;
