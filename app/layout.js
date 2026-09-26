import "./globals.css";

export const metadata = {
  title: "Apuntado",
  description: "Marcador multijugador para Apuntado"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
