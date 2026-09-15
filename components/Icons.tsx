/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

// Stopwatch Icon for Timer
export const TimerIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="13" r="8" stroke="#E25C5C" strokeWidth="2.4" fill="#FFEFEF" />
    <path d="M12 9V13L15 15" stroke="#C94444" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M10 2H14" stroke="#66462C" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 2V5" stroke="#66462C" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M18.5 5.5L19.5 6.5" stroke="#66462C" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// Golden Star Icon
export const StarIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 2.5L14.9 8.6L21.6 9.5L16.7 14.2L17.9 20.8L12 17.6L6.1 20.8L7.3 14.2L2.4 9.5L9.1 8.6L12 2.5Z"
      fill="#FFD233"
      stroke="#DDA012"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M10 6L11.5 9L15 9.5L12.5 12"
      stroke="#FFF3A8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

// Sound / Speaker Icon
export const SpeakerIcon: React.FC<{ soundOn: boolean; className?: string }> = ({ soundOn, className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      fill="#6B462B"
      stroke="#6B462B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {soundOn ? (
      <>
        <path d="M15.5 8.5C16.8 9.8 17.5 11.2 17.5 12C17.5 12.8 16.8 14.2 15.5 15.5" stroke="#6B462B" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 6C20.8 7.8 22 9.8 22 12C22 14.2 20.8 16.2 19 18" stroke="#6B462B" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : (
      <path d="M16 9L21 15M21 9L16 15" stroke="#E05252" strokeWidth="2.2" strokeLinecap="round" />
    )}
  </svg>
);

// Gear / Settings Icon
export const GearIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      fill="#6B462B"
    />
    <path
      d="M19.4 13C19.45 12.67 19.5 12.34 19.5 12C19.5 11.66 19.45 11.33 19.4 11L21.54 9.33C21.73 9.18 21.78 8.91 21.66 8.69L19.66 5.23C19.54 5.01 19.27 4.93 19.05 5.01L16.53 6.03C16 5.62 15.43 5.29 14.81 5.04L14.43 2.36C14.4 2.12 14.19 1.95 13.94 1.95H9.94C9.69 1.95 9.49 2.12 9.45 2.36L9.07 5.04C8.45 5.29 7.88 5.63 7.35 6.03L4.83 5.01C4.61 4.92 4.34 5.01 4.22 5.23L2.22 8.69C2.1 8.91 2.15 9.18 2.34 9.33L4.48 11C4.43 11.33 4.38 11.67 4.38 12C4.38 12.33 4.43 12.67 4.48 13L2.34 14.67C2.15 14.82 2.1 15.09 2.22 15.31L4.22 18.77C4.34 18.99 4.61 19.08 4.83 18.99L7.35 17.97C7.88 18.38 8.45 18.71 9.07 18.96L9.45 21.64C9.49 21.88 9.69 22.05 9.94 22.05H13.94C14.19 22.05 14.4 21.88 14.43 21.64L14.81 18.96C15.43 18.71 16 18.38 16.53 17.97L19.05 18.99C19.27 19.08 19.54 18.99 19.66 18.77L21.66 15.31C21.78 15.09 21.73 14.82 21.54 14.67L19.4 13Z"
      stroke="#6B462B"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Cat Paw Print Icon
export const PawIcon: React.FC<{ color?: string; className?: string }> = ({ color = "#F68282", className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Main pad */}
    <ellipse cx="12" cy="15.5" rx="4.5" ry="3.8" fill={color} />
    {/* 4 toe beans */}
    <circle cx="6.5" cy="10" r="2.2" fill={color} />
    <circle cx="10" cy="7.2" r="2.2" fill={color} />
    <circle cx="14" cy="7.2" r="2.2" fill={color} />
    <circle cx="17.5" cy="10" r="2.2" fill={color} />
  </svg>
);

// Reset / Rotate Icon
export const ResetIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M4 12C4 7.58172 7.58172 4 12 4C15.5341 4 18.5284 6.28919 19.5694 9.5M20 12C20 16.4183 16.4183 20 12 20C8.46589 20 5.47164 17.7108 4.43063 14.5"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path d="M19 5V10H14" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19V14H10" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Chubby Tabby Cat Head (Exact style from Figma tile)
export const CatHeadGraphic: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer shadow */}
    <ellipse cx="50" cy="52" rx="38" ry="32" fill="#F4EADB" />
    {/* Ears */}
    {/* Left Ear */}
    <path d="M22 36L14 14C13 11 16 9 19 11L36 24C30 27 26 31 22 36Z" fill="#8B7365" stroke="#5C4538" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M22 30L17 17C16 15 18 14 20 15L31 23C27 25 24 27 22 30Z" fill="#F7B2B2" />
    {/* Right Ear */}
    <path d="M78 36L86 14C87 11 84 9 81 11L64 24C70 27 74 31 78 36Z" fill="#8B7365" stroke="#5C4538" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M78 30L83 17C84 15 82 14 80 15L69 23C73 25 76 27 78 30Z" fill="#F7B2B2" />

    {/* Chubby Head Base */}
    <ellipse cx="50" cy="48" rx="36" ry="30" fill="#FFFFFF" stroke="#5C4538" strokeWidth="2.5" />
    
    {/* Tabby Brown/Grey Patches on forehead and cheeks */}
    <path d="M42 20H58V26C58 29 55 31 50 31C45 31 42 29 42 26V20Z" fill="#A89485" />
    <path d="M46 19H54V24C54 26 52 27 50 27C48 27 46 26 46 24V19Z" fill="#755E4F" />
    <path d="M18 42C20 40 24 41 24 43C24 45 20 47 18 45C17 44 17 43 18 42Z" fill="#A89485" />
    <path d="M82 42C80 40 76 41 76 43C76 45 80 47 82 45C83 44 83 43 82 42Z" fill="#A89485" />

    {/* Eyes */}
    <ellipse cx="36" cy="46" rx="3.5" ry="4" fill="#3D291D" />
    <circle cx="35" cy="44.5" r="1.2" fill="#FFFFFF" />
    <ellipse cx="64" cy="46" rx="3.5" ry="4" fill="#3D291D" />
    <circle cx="63" cy="44.5" r="1.2" fill="#FFFFFF" />

    {/* Pink Cheeks */}
    <ellipse cx="26" cy="52" rx="4.5" ry="2.5" fill="#FFAFAF" opacity="0.85" />
    <ellipse cx="74" cy="52" rx="4.5" ry="2.5" fill="#FFAFAF" opacity="0.85" />

    {/* Nose & Mouth */}
    <path d="M50 49L48 51.5H52L50 49Z" fill="#E67E7E" />
    {/* Cute smiling mouth with open tongue */}
    <path d="M45 52C47 54 49 53 50 51.5C51 53 53 54 55 52" stroke="#5C4538" strokeWidth="2" strokeLinecap="round" />
    <path d="M47.5 53C47.5 56 52.5 56 52.5 53Z" fill="#FF8383" stroke="#5C4538" strokeWidth="1.2" />

    {/* Whiskers */}
    <line x1="14" y1="48" x2="23" y2="49" stroke="#5C4538" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="13" y1="54" x2="22" y2="53" stroke="#5C4538" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="86" y1="48" x2="77" y2="49" stroke="#5C4538" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="87" y1="54" x2="78" y2="53" stroke="#5C4538" strokeWidth="1.8" strokeLinecap="round" />

    {/* Cute striped tail curled at right side */}
    <path d="M74 65C82 65 86 59 86 54C86 51 83 50 81 52C79 55 77 60 70 61" stroke="#5C4538" strokeWidth="6" strokeLinecap="round" />
    <path d="M74 65C82 65 86 59 86 54C86 51 83 50 81 52C79 55 77 60 70 61" stroke="#8B7365" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// Fish Collectible Graphic (with sparkle)
export const FishGraphic: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 70 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sparkles */}
    <circle cx="56" cy="12" r="1.8" fill="#F8B82A" />
    <path d="M59 8L60 12L64 13L60 14L59 18L58 14L54 13L58 12L59 8Z" fill="#FFC933" />
    <path d="M12 36L13 38L15 39L13 40L12 42L11 40L9 39L11 38L12 36Z" fill="#FFC933" />

    {/* Fish Tail */}
    <path
      d="M52 25L63 15C64.5 13.5 67 15 66 17.5L62 25L66 32.5C67 35 64.5 36.5 63 35L52 25Z"
      fill="#85C2E6"
      stroke="#3D6882"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Fish Body */}
    <ellipse cx="32" cy="25" rx="22" ry="15" fill="#A4D7F4" stroke="#3D6882" strokeWidth="2.4" />
    {/* Belly Highlight */}
    <path d="M16 27C18 34 32 37 46 32C36 37 22 36 16 27Z" fill="#D2EFFE" />
    {/* Fin */}
    <path d="M30 23C34 23 37 26 35 29C32 30 28 27 30 23Z" fill="#72B6DF" stroke="#3D6882" strokeWidth="1.8" />
    {/* Eye */}
    <circle cx="21" cy="21" r="3.2" fill="#FFFFFF" stroke="#3D6882" strokeWidth="1.8" />
    <circle cx="20" cy="20.5" r="1.4" fill="#2C485A" />
    {/* Gills curve */}
    <path d="M27 17C29 20 29 28 27 32" stroke="#689EBF" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Finish Checkered Flag Graphic (Saucer/Goal)
export const CheckeredFlagGraphic: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sparkle rays */}
    <path d="M14 16L17 19" stroke="#E6A820" strokeWidth="2" strokeLinecap="round" />
    <path d="M49 14L46 17" stroke="#E6A820" strokeWidth="2" strokeLinecap="round" />
    <path d="M51 29L47 29" stroke="#E6A820" strokeWidth="2" strokeLinecap="round" />

    {/* Wooden Pole */}
    <path d="M21 16V50" stroke="#7A4E2D" strokeWidth="3.6" strokeLinecap="round" />
    <circle cx="21" cy="15" r="3" fill="#D99E32" stroke="#7A4E2D" strokeWidth="1.6" />

    {/* Flag Body */}
    <g transform="translate(23, 17)">
      {/* Outer border */}
      <rect x="0" y="0" width="26" height="20" rx="2" fill="#FFFFFF" stroke="#42352B" strokeWidth="2" />
      {/* Checkers 3x4 grid */}
      <rect x="0" y="0" width="6.5" height="5" fill="#3D322B" />
      <rect x="13" y="0" width="6.5" height="5" fill="#3D322B" />
      <rect x="6.5" y="5" width="6.5" height="5" fill="#3D322B" />
      <rect x="19.5" y="5" width="6.5" height="5" fill="#3D322B" />
      <rect x="0" y="10" width="6.5" height="5" fill="#3D322B" />
      <rect x="13" y="10" width="6.5" height="5" fill="#3D322B" />
      <rect x="6.5" y="15" width="6.5" height="5" fill="#3D322B" />
      <rect x="19.5" y="15" width="6.5" height="5" fill="#3D322B" />
    </g>
  </svg>
);

// Rock Obstacle Graphic (dark stones on dark earth)
export const RockGraphic: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Dark earth soil texture */}
    <rect width="64" height="64" rx="10" fill="#3D3836" />
    {/* Soil speckles */}
    <circle cx="16" cy="18" r="1.5" fill="#4E4744" />
    <circle cx="48" cy="22" r="1.5" fill="#4E4744" />
    <circle cx="52" cy="46" r="1.5" fill="#4E4744" />
    <circle cx="18" cy="48" r="1.5" fill="#4E4744" />

    {/* Little moss/grass sprouts */}
    <path d="M22 41C20 38 18 39 17 42" stroke="#688E3E" strokeWidth="2" strokeLinecap="round" />
    <path d="M47 39C49 37 51 38 51 41" stroke="#688E3E" strokeWidth="2" strokeLinecap="round" />

    {/* Big Rock */}
    <ellipse cx="32" cy="38" rx="14" ry="11" fill="#615B57" stroke="#332E2C" strokeWidth="2" />
    <path d="M24 35C27 31 36 31 40 34" stroke="#7A746F" strokeWidth="1.8" strokeLinecap="round" />

    {/* Small Rock alongside */}
    <ellipse cx="44" cy="42" rx="8" ry="6" fill="#544F4C" stroke="#332E2C" strokeWidth="1.8" />
  </svg>
);

// Bush Obstacle Graphic (green bush with white flowers)
export const BushGraphic: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Background dark soil */}
    <rect width="64" height="64" rx="10" fill="#3D3836" />

    {/* Bush Leaves Cluster */}
    <g transform="translate(6, 12)">
      <circle cx="16" cy="22" r="13" fill="#69A142" stroke="#3D5F23" strokeWidth="2" />
      <circle cx="34" cy="22" r="13" fill="#69A142" stroke="#3D5F23" strokeWidth="2" />
      <circle cx="25" cy="14" r="14" fill="#7AB94D" stroke="#3D5F23" strokeWidth="2" />
      <circle cx="20" cy="24" r="10" fill="#88C757" />

      {/* Flower 1 (White with yellow center) */}
      <circle cx="18" cy="20" r="3.2" fill="#FFFFFF" />
      <circle cx="18" cy="20" r="1.4" fill="#FFC933" />

      {/* Flower 2 */}
      <circle cx="32" cy="18" r="3.2" fill="#FFFFFF" />
      <circle cx="32" cy="18" r="1.4" fill="#FFC933" />

      {/* Flower 3 */}
      <circle cx="26" cy="28" r="2.8" fill="#FFFFFF" />
      <circle cx="26" cy="28" r="1.2" fill="#FFC933" />
    </g>
  </svg>
);

// Sleeping Calico Cat (Bottom right decoration)
export const SleepingCatGraphic: React.FC<{ className?: string }> = ({ className = "w-28 h-18" }) => (
  <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Little pebbles next to cat */}
    <ellipse cx="16" cy="55" rx="6" ry="4" fill="#8C847E" stroke="#5E5652" strokeWidth="1.5" />
    <ellipse cx="28" cy="58" rx="4" ry="2.8" fill="#A89E97" stroke="#5E5652" strokeWidth="1.2" />

    {/* Tail curled around body */}
    <path d="M106 50C114 44 114 36 108 30C104 26 98 28 98 32C98 38 102 46 95 48" stroke="#5C4538" strokeWidth="6" strokeLinecap="round" />
    <path d="M106 50C114 44 114 36 108 30C104 26 98 28 98 32C98 38 102 46 95 48" stroke="#A85B32" strokeWidth="4" strokeLinecap="round" />

    {/* Body */}
    <ellipse cx="68" cy="44" rx="34" ry="20" fill="#FFFFFF" stroke="#5C4538" strokeWidth="2.5" />
    {/* Calico orange and dark patches */}
    <path d="M72 26C82 26 92 32 94 40C88 44 80 40 76 34Z" fill="#C9713C" />
    <path d="M88 34C96 34 102 38 100 48C94 48 90 44 88 34Z" fill="#4A413C" />

    {/* Head resting */}
    <circle cx="42" cy="42" r="18" fill="#FFFFFF" stroke="#5C4538" strokeWidth="2.5" />
    {/* Left Ear */}
    <path d="M30 30L34 18C35 16 38 16 39 19L44 26" fill="#C9713C" stroke="#5C4538" strokeWidth="2" strokeLinejoin="round" />
    {/* Right Ear */}
    <path d="M48 26L54 18C55 16 58 17 58 19L57 30" fill="#4A413C" stroke="#5C4538" strokeWidth="2" strokeLinejoin="round" />

    {/* Sleeping curved eyes `u u` */}
    <path d="M33 42C35 44 38 44 40 42" stroke="#5C4538" strokeWidth="2" strokeLinecap="round" />
    <path d="M46 42C48 44 51 44 53 42" stroke="#5C4538" strokeWidth="2" strokeLinecap="round" />

    {/* Tiny Nose */}
    <path d="M43 45L42 46.5H44L43 45Z" fill="#E67E7E" />

    {/* Whiskers */}
    <line x1="24" y1="42" x2="30" y2="43" stroke="#5C4538" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="25" y1="46" x2="31" y2="46" stroke="#5C4538" strokeWidth="1.5" strokeLinecap="round" />

    {/* Front paws tucked */}
    <ellipse cx="46" cy="58" rx="6" ry="3.5" fill="#FFFFFF" stroke="#5C4538" strokeWidth="1.8" />
    <ellipse cx="60" cy="58" rx="6" ry="3.5" fill="#FFFFFF" stroke="#5C4538" strokeWidth="1.8" />
  </svg>
);

// Wooden Signpost with Paw Print (Bottom left decoration)
export const WoodenSignpost: React.FC<{ className?: string }> = ({ className = "w-20 h-24" }) => (
  <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Wooden Post in ground */}
    <rect x="34" y="32" width="10" height="54" rx="2" fill="#8B623E" stroke="#57381F" strokeWidth="2.2" />
    {/* Wood post grain */}
    <line x1="38" y1="36" x2="38" y2="80" stroke="#714C2D" strokeWidth="1.5" />

    {/* Arrow Signboard pointing right */}
    <path
      d="M10 14H58L72 27L58 40H10C8.5 40 7 38.5 7 37V17C7 15.5 8.5 14 10 14Z"
      fill="#D7B58B"
      stroke="#57381F"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Wood sign inner line */}
    <path
      d="M12 17H56L68 27L56 37H12C11 37 10 36 10 35V19C10 18 11 17 12 17Z"
      stroke="#F2D8B8"
      strokeWidth="1.2"
    />

    {/* Brown Paw Print on sign */}
    <g transform="translate(24, 18)">
      <ellipse cx="12" cy="11" rx="4.5" ry="3.5" fill="#6B482B" />
      <circle cx="7" cy="5.5" r="2" fill="#6B482B" />
      <circle cx="10.5" cy="3.5" r="2" fill="#6B482B" />
      <circle cx="14" cy="3.5" r="2" fill="#6B482B" />
      <circle cx="17.5" cy="5.5" r="2" fill="#6B482B" />
    </g>

    {/* Grass tufts around base */}
    <path d="M28 84C27 78 23 76 20 84" stroke="#5E8E2D" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M48 84C49 77 54 75 56 84" stroke="#5E8E2D" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

// Peeking Cat Header on Level Badge
export const PeekingCatGraphic: React.FC<{ className?: string }> = ({ className = "w-10 h-7" }) => (
  <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left Ear */}
    <path d="M12 28L6 10C5 8 8 7 10 9L20 18" fill="#8B7365" stroke="#5C4538" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 22L8 13C7 11 9 10 11 11L18 18" fill="#F7B2B2" />
    {/* Right Ear */}
    <path d="M48 28L54 10C55 8 52 7 50 9L40 18" fill="#8B7365" stroke="#5C4538" strokeWidth="2" strokeLinejoin="round" />
    <path d="M48 22L52 13C53 11 51 10 49 11L42 18" fill="#F7B2B2" />

    {/* Head dome peeking */}
    <path d="M12 36C12 22 20 14 30 14C40 14 48 22 48 36" fill="#FFFFFF" stroke="#5C4538" strokeWidth="2.2" />

    {/* Forehead stripes */}
    <path d="M26 15H34V19C34 21 32 22 30 22C28 22 26 21 26 19V15Z" fill="#A89485" />

    {/* Eyes */}
    <ellipse cx="23" cy="27" rx="2.5" ry="3" fill="#3D291D" />
    <circle cx="22" cy="26" r="1" fill="#FFFFFF" />
    <ellipse cx="37" cy="27" rx="2.5" ry="3" fill="#3D291D" />
    <circle cx="36" cy="26" r="1" fill="#FFFFFF" />

    {/* Blushing cheeks */}
    <ellipse cx="17" cy="31" rx="3.5" ry="1.8" fill="#FFAFAF" />
    <ellipse cx="43" cy="31" rx="3.5" ry="1.8" fill="#FFAFAF" />

    {/* Tiny Nose & Mouth */}
    <path d="M30 29L28.5 31H31.5L30 29Z" fill="#E67E7E" />
    <path d="M28 32C29 33.5 30 33 30 32C30 33 31 33.5 32 32" stroke="#5C4538" strokeWidth="1.5" strokeLinecap="round" />

    {/* Paws on badge edge */}
    <ellipse cx="18" cy="37" rx="4" ry="2.5" fill="#FFFFFF" stroke="#5C4538" strokeWidth="1.8" />
    <ellipse cx="42" cy="37" rx="4" ry="2.5" fill="#FFFFFF" stroke="#5C4538" strokeWidth="1.8" />
  </svg>
);
