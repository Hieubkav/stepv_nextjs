export default function Head() {
  return (
    <>
      {/* Font Awesome for social icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://stepv.studio" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />

      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="https://stepv.studio" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />

      {/* Prefetch critical resources */}
      <link rel="prefetch" href="/hero-glass.jpg" as="image" />
      <link rel="prefetch" href="/hero-glass-video.mp4" as="video" />

      {/* Resource Hints for performance */}
      <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
    </>
  );
}
