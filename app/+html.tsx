import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

                {/* iOS Safari Standalone App Config */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="YÖKDİL" />

                {/* Prevent Pull-to-refresh & Scrolling glitches in PWA */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          body {
            overscroll-behavior-y: none;
            user-select: none;
            -webkit-user-select: none;
          }
        ` }} />

                {/* Add custom root styling */}
                <ScrollViewStyleReset />
            </head>
            <body>{children}</body>
        </html>
    );
}
