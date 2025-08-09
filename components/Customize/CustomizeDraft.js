import React, { useRef, useState, useEffect } from "react";

export default function TshirtDesigner() {
  const shirtColors = [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#111827" },
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#10b981" },
    { name: "Yellow", hex: "#f59e0b" },
  ];

  const [selectedColor, setSelectedColor] = useState(shirtColors[0].hex);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [imgScale, setImgScale] = useState(1);
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState(null);
  const [designVisible, setDesignVisible] = useState(true);
  const previewRef = useRef(null);
  const designRef = useRef(null);

  // load file
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImg(ev.target.result);
    reader.readAsDataURL(file);
    // reset position/scale
    setImgScale(1);
    setImgPos({ x: 0, y: 0 });
  };

  // pointer / drag handlers for moving the design over the shirt
  const onPointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
  };
  const onPointerMove = (e) => {
    if (!isDragging || !lastPointer) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    setImgPos((p) => ({ x: p.x + dx, y: p.y + dy }));
    setLastPointer({ x: e.clientX, y: e.clientY });
  };
  const onPointerUp = () => {
    setIsDragging(false);
    setLastPointer(null);
  };

  useEffect(() => {
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [isDragging, lastPointer]);

  // Create final composed image by drawing the shirt SVG and the design image onto a canvas
  const composeAndSubmit = async () => {
    const preview = previewRef.current;
    if (!preview) return alert("Preview not ready");

    // Compute canvas size
    const width = 800;
    const height = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Draw shirt background (rounded rectangle + neck) as base — reproduce SVG look
    // Background
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, width, height);

    // Optionally draw a shirt silhouette to make it look nicer (simple approximation)
    // draw a centered rounded rectangle for body
    ctx.fillStyle = selectedColor;
    roundRect(ctx, width * 0.1, height * 0.12, width * 0.8, height * 0.76, 60);
    ctx.fill();

    // Draw uploaded design by loading the image and placing it using imgPos & imgScale relative to preview box
    if (uploadedImg && designRef.current) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = uploadedImg;
      await new Promise((res) => (img.onload = res));

      // previewRef size -> mapping
      const box = preview.getBoundingClientRect();
      const px = imgPos.x + box.width / 2; // center-based position adjustments
      const py = imgPos.y + box.height / 2;

      // We'll draw design centered in the preview area, mapping to canvas
      const drawW = img.width * imgScale;
      const drawH = img.height * imgScale;

      // Map preview coordinates to canvas coordinates
      const canvasX = (box.left - preview.getBoundingClientRect().left) || (width * 0.5 - drawW / 2);

      // Simpler approach: center the design on canvas and apply position offsets relative to preview
      const centerX = width / 2 + imgPos.x * (width / box.width);
      const centerY = height / 2 + imgPos.y * (height / box.height);

      ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    }

    // export image
    const dataUrl = canvas.toDataURL("image/png");

    // send to backend
    try {
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, color: selectedColor }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      alert("Design submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Submission failed. Check console for details.");
    }
  };

  // helper: rounded rectangle for canvas
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">T-shirt Designer</h1>
        <p className="mb-6 text-sm text-gray-600">Upload your design, pick a shirt color, position and scale your design, then submit to place an order.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="col-span-1 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">1. Shirt color</h2>
            <div className="flex gap-3 flex-wrap mb-4">
              {shirtColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-10 h-10 rounded-full border ${selectedColor === c.hex ? "ring-4 ring-offset-2 ring-indigo-300" : ""}`}
                  style={{ background: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>

            <h2 className="font-semibold mb-3">2. Upload design</h2>
            <input type="file" accept="image/*" onChange={onFileChange} className="mb-3" />
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Show design on preview</label>
              <input type="checkbox" checked={designVisible} onChange={(e) => setDesignVisible(e.target.checked)} />
            </div>

            <h2 className="font-semibold mb-3">3. Position & scale</h2>
            <div className="mb-2">
              <label className="block text-sm">Scale</label>
              <input type="range" min="0.1" max="3" step="0.01" value={imgScale} onChange={(e) => setImgScale(parseFloat(e.target.value))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Reset position</label>
              <button className="mt-2 px-3 py-1 bg-gray-200 rounded" onClick={() => { setImgPos({ x: 0, y: 0 }); setImgScale(1); }}>Reset</button>
            </div>

            <div className="mt-6">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded shadow" onClick={composeAndSubmit}>Submit Design</button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>Note: Implement server side `/api/submit-order` to receive the PNG (base64 in JSON) and save/process it.</p>
            </div>
          </div>

          {/* Center: Preview */}
          <div className="col-span-1 md:col-span-2 bg-white p-6 rounded shadow flex flex-col">
            <h2 className="font-semibold mb-3">Live preview</h2>
            <div className="flex gap-4 items-start">
              <div className="relative flex-1 flex justify-center items-start">
                {/* Preview area */}
                <div ref={previewRef} className="relative w-96 h-[550px] bg-gray-100 rounded-lg flex items-center justify-center">
                  {/* Shirt SVG centered */}
                  <svg viewBox="0 0 300 360" className="w-72 h-[360px]">
                    <defs></defs>
                    <g>
                      <path d="M50 40 C40 40 30 50 30 60 L30 110 C30 120 40 130 50 130 L80 130 C85 130 90 135 90 140 L90 160 C90 180 110 200 150 200 C190 200 210 180 210 160 L210 140 C210 135 215 130 220 130 L250 130 C260 130 270 120 270 110 L270 60 C270 50 260 40 250 40 L200 40 C190 40 180 50 170 50 L150 60 L130 50 C120 50 110 40 100 40 Z" fill={selectedColor} stroke="#111" strokeWidth="1" />
                    </g>
                  </svg>

                  {/* Design overlay (draggable) */}
                  {uploadedImg && designVisible && (
                    <div
                      ref={designRef}
                      onPointerDown={onPointerDown}
                      className="absolute cursor-grab touch-none"
                      style={{
                        transform: `translate(${imgPos.x}px, ${imgPos.y}px) scale(${imgScale})`,
                        transition: isDragging ? "none" : "transform 0.1s",
                        left: "50%",
                        top: "50%",
                        transformOrigin: "center",
                      }}
                    >
                      <img src={uploadedImg} alt="design" style={{ width: 180, height: "auto", maxWidth: 260, maxHeight: 260, display: "block" }} />
                    </div>
                  )}
                </div>

                {/* Instructions / helper */}
                <div className="ml-4 w-48 text-sm text-gray-600">
                  <p className="mb-2"><strong>How to position:</strong></p>
                  <ul className="list-disc ml-5">
                    <li>Click & drag the design to move it.</li>
                    <li>Use the scale slider to resize.</li>
                    <li>Press Reset to return to default.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-500">Preview area is interactive — drag the uploaded image to change placement. When you submit, the page will create a PNG and send it to your server.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
