import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeBox({ url, size = 220 }) {
  if (!url) return null;

  return (
    <div className="qr-box">
      <QRCodeSVG value={url} size={size} />
      <p className="qr-url">{url}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="qr-link">
        Abrir link público
      </a>
    </div>
  );
}
