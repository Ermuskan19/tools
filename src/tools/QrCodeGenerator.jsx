import { useState } from 'react';
import QRCode from 'qrcode';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [dataUrl, setDataUrl] = useState(null);

  const generate = async (nextText) => {
    if (!nextText) {
      setDataUrl(null);
      return;
    }
    try {
      const url = await QRCode.toDataURL(nextText, {
        width: size,
        color: { dark: foreground, light: background }
      });
      setDataUrl(url);
    } catch {
      setDataUrl(null);
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="QR Code Generator" description="Create QR codes for URLs, text, WiFi, and contact cards instantly in your browser.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Content</label>
          <input
            className="tool-input"
            value={text}
            onChange={(e) => { setText(e.target.value); generate(e.target.value); }}
            spellCheck={false}
            placeholder="URL, text, or WiFi credentials..."
          />
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Size (px)</label>
              <input
                className="tool-input"
                type="range"
                min="128"
                max="512"
                value={size}
                onChange={(e) => { setSize(Number(e.target.value)); generate(text); }}
              />
              <span className="control-value">{size}</span>
            </div>
            <div className="control-group">
              <label className="tool-label">Color</label>
              <input
                className="stop-color"
                type="color"
                value={foreground}
                onChange={(e) => { setForeground(e.target.value); generate(text); }}
              />
            </div>
            <div className="control-group">
              <label className="tool-label">Background</label>
              <input
                className="stop-color"
                type="color"
                value={background}
                onChange={(e) => { setBackground(e.target.value); generate(text); }}
              />
            </div>
          </div>
        </div>

        <div className="qr-preview">
          {dataUrl ? (
            <div className="qr-card">
              <img src={dataUrl} alt="QR code" style={{ width: size, height: size }} />
            </div>
          ) : (
            <div className="drop-zone">Enter content to generate a QR code</div>
          )}
        </div>

        {dataUrl && (
          <div className="tool-actions">
            <button className="tool-btn tool-btn-primary" onClick={download}>Download PNG</button>
            <CopyButton text={dataUrl} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default QrCodeGenerator;
