import React from 'react';

export const VisaLogo = ({ height = 28 }: { height?: number }) => (
  <svg
    height={height}
    viewBox="0 0 50 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ borderRadius: '5px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
  >
    <rect width="50" height="32" rx="5" fill="#FFFFFF" />
    {/* VISA text */}
    <path
      d="M20.2 21.5L22.6 8.5H26.3L23.9 21.5H20.2ZM35.8 8.8C35.0 8.5 33.7 8.2 32.2 8.2C28.5 8.2 25.9 10.1 25.9 12.8C25.9 14.8 27.8 15.9 29.2 16.6C30.6 17.3 31.1 17.7 31.1 18.3C31.1 19.3 29.9 19.7 28.7 19.7C27.2 19.7 26.3 19.4 25.0 18.8L24.4 18.5L23.7 21.8C24.7 22.3 26.5 22.6 28.3 22.6C32.3 22.6 34.9 20.7 34.9 17.8C34.9 15.6 33.5 14.5 31.6 13.6C30.4 13.0 29.7 12.6 29.7 11.9C29.7 11.3 30.4 10.7 31.8 10.7C33.0 10.7 33.9 11.0 34.7 11.3L35.1 11.5L35.8 8.8ZM44.2 8.5H41.3C40.4 8.5 39.7 9.0 39.3 9.8L33.6 21.5H37.5L38.3 19.3H43.1L43.5 21.5H47.0L44.2 8.5ZM39.4 16.4L41.3 11.2L42.5 16.4H39.4ZM17.1 8.5L13.5 17.4L13.1 15.4C12.4 13.2 10.4 10.8 8.1 9.6L11.4 21.5H15.4L21.3 8.5H17.1ZM10.2 9.0C9.7 8.8 9.0 8.6 8.2 8.6H7.6C7.0 8.6 6.5 9.1 6.5 9.7C6.5 9.9 6.6 10.2 6.8 10.4L11.5 19.8L10.2 9.0Z"
      fill="#1A1F71"
    />
    <path
      d="M13.1 15.4L13.5 17.4L10.2 9.0C11.1 9.4 12.3 12.0 13.1 15.4Z"
      fill="#F7B600"
    />
  </svg>
);

export const MastercardLogo = ({ height = 28 }: { height?: number }) => (
  <svg
    height={height}
    viewBox="0 0 50 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ borderRadius: '5px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
  >
    <rect width="50" height="32" rx="5" fill="#FFFFFF" />
    <circle cx="20" cy="16" r="10" fill="#EB001B" />
    <circle cx="30" cy="16" r="10" fill="#F79E1B" />
    <path
      d="M25 9.2C27.2 10.9 28.7 13.3 28.7 16C28.7 18.7 27.2 21.1 25 22.8C22.8 21.1 21.3 18.7 21.3 16C21.3 13.3 22.8 10.9 25 9.2Z"
      fill="#FF5F00"
    />
  </svg>
);

export const AmexLogo = ({ height = 28 }: { height?: number }) => (
  <svg
    height={height}
    viewBox="0 0 50 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ borderRadius: '5px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
  >
    <rect width="50" height="32" rx="5" fill="#006FCF" />
    <text
      x="25"
      y="20.5"
      fill="#FFFFFF"
      fontSize="11"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.08em"
      textAnchor="middle"
    >
      AMEX
    </text>
  </svg>
);

export const WhatsAppLogo = ({ height = 28 }: { height?: number }) => (
  <svg
    height={height}
    viewBox="0 0 50 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ borderRadius: '5px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
  >
    <rect width="50" height="32" rx="5" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M25 6C19.5 6 15 10.5 15 16C15 18 15.6 19.8 16.6 21.4L15.3 25.5L19.6 24.4C21.2 25.4 23.1 26 25 26C30.5 26 35 21.5 35 16C35 10.5 30.5 6 25 6ZM22.1 12.4C21.9 11.9 21.6 11.9 21.3 11.9C21.1 11.8 20.8 11.8 20.5 11.8C20.3 11.8 19.8 11.9 19.5 12.3C19.2 12.7 18.2 13.6 18.2 15.4C18.2 17.2 19.5 19 19.7 19.3C19.9 19.5 22.3 23.4 26.2 24.9C29.1 26.1 29.8 25.7 30.4 25.6C31.3 25.5 32.6 24.6 32.9 23.8C33.2 23 33.2 22.4 33.1 22.2C33 22.1 32.8 22 32.4 21.8C32 21.6 30.2 20.7 29.8 20.6C29.5 20.5 29.3 20.4 29 20.8C28.8 21.1 28.1 22 27.9 22.2C27.7 22.5 27.5 22.5 27.1 22.3C26.7 22.1 25.5 21.7 24.1 20.4C23 19.4 22.2 18.2 22 17.8C21.8 17.4 22 17.2 22.2 17.1C22.3 16.9 22.5 16.6 22.7 16.4C22.9 16.2 23 16 23.1 15.7C23.2 15.5 23.2 15.3 23.1 15.1C23 14.9 22.4 13.1 22.1 12.4Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const PayHereLogo = ({ height = 28 }: { height?: number }) => (
  <svg
    height={height}
    viewBox="0 0 68 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ borderRadius: '5px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
  >
    <rect width="68" height="32" rx="5" fill="#0A1E3F" stroke="#1E3A8A" strokeWidth="1" />
    {/* PayHere Shield Icon */}
    <path
      d="M10 9L17 6L24 9V15.5C24 20.5 20.5 24 17 25.5C13.5 24 10 20.5 10 15.5V9Z"
      fill="#00B4D8"
    />
    <path
      d="M14 15.5L16.5 18L20 12.5"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* PayHere Typography */}
    <text
      x="28"
      y="17"
      fill="#FFFFFF"
      fontSize="10"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Pay
    </text>
    <text
      x="46"
      y="17"
      fill="#00B4D8"
      fontSize="10"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >
      Here
    </text>
    <text
      x="28"
      y="24"
      fill="#94A3B8"
      fontSize="5.5"
      fontWeight="700"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letterSpacing="0.06em"
    >
      VERIFIED
    </text>
  </svg>
);
