export const metadata = {
  title: 'Glass Fruit ? Cinematic Close-up',
  description: 'Hyper-realistic glass fruit rendered in WebGL with soft hues.'
};

import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
