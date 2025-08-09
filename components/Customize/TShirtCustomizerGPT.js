import React, { useRef, useState, useEffect } from "react";

const shirtPath = `M50 40 C40 40 30 50 30 60 L30 110 C30 120 40 130 50 130 L80 130 C85 130 90 135 90 140 L90 160 C90 180 110 200 150 200 C190 200 210 180 210 160 L210 140 C210 135 215 130 220 130 L250 130 C260 130 270 120 270 110 L270 60 C270 50 260 40 250 40 L200 40 C190 40 180 50 170 50 L150 60 L130 50 C120 50 110 40 100 40 Z`;

const defaultColors = [
  { name: "Black", hex: "#000000", preview: "/preview-images/Black.png" },
  { name: "White", hex: "#ffffff", preview: "/preview-images/White.png" },
  { name: "Green", hex: "#4CAF50", preview: "/preview-images/Green.png" },
  { name: "Maroon", hex: "#800000", preview: "/preview-images/Maroon.png" },
  { name: "Navy", hex: "#000080", preview: "/preview-images/Navy Blue.png" },
  { name: "Red", hex: "#FF0000", preview: "/preview-images/Red.png" },
];

export default function TshirtCustomizerGPT() {
  const [product, setProduct] = useState("tshirt");
  const [side, setSide] = useState("front");
  const [colors] = useState(defaultColors);
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);

  // Each side holds an array of design items
  const [designs, setDesigns] = useState({ front: [], back: [] });
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  // pointer drag state
  const pointerState = useRef(null);

  useEffect(() => {
    function up() {
      if (pointerState.current) pointerState.current.draggingId = null;
    }
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  // Helpers
  const addImage = (dataUrl) => {
    const id = "i_" + Date.now();
    const item = { id, type: "image", src: dataUrl, x: 0, y: 0, scale: 1 };
    setDesigns((d) => ({ ...d, [side]: [...d[side], item] }));
    setActiveId(id);
  };

  const addText = (txt) => {
    const id = "t_" + Date.now();
    const item = { id, type: "text", text: txt, color: "#000000", font: "48px Poppins, Arial", x: 0, y: 0, scale: 1 };
    setDesigns((d) => ({ ...d, [side]: [...d[side], item] }));
    setActiveId(id);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please upload an image file");
    const reader = new FileReader();
    reader.onload = (ev) => addImage(String(ev.target?.result));
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = ""; // reset
  };

  // Start dragging
  const handlePointerDownItem = (e, id) => {
    e.stopPropagation();
    if (e.currentTarget?.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    pointerState.current = { draggingId: id, lastX: e.clientX, lastY: e.clientY };
    setActiveId(id);
  };

  const handlePointerMove = (e) => {
    if (!pointerState.current || !pointerState.current.draggingId) return;
    const pid = pointerState.current.draggingId;
    const dx = e.clientX - pointerState.current.lastX;
    const dy = e.clientY - pointerState.current.lastY;
    pointerState.current.lastX = e.clientX;
    pointerState.current.lastY = e.clientY;

    // Map dx/dy (pixel) to relative coordinates based on preview box
    const box = previewRef.current?.getBoundingClientRect();
    if (!box) return;
    const relX = dx / box.width;
    const relY = dy / box.height;

    setDesigns((prev) => {
      const arr = [...prev[side]];
      const idx = arr.findIndex((a) => a.id === pid);
      if (idx === -1) return prev;
      arr[idx] = { ...arr[idx], x: arr[idx].x + relX, y: arr[idx].y + relY };
      return { ...prev, [side]: arr };
    });
  };

  // Scale handler (from range input)
  const updateScale = (id, val) => {
    setDesigns((prev) => {
      const arr = [...prev[side]];
      const idx = arr.findIndex((a) => a.id === id);
      if (idx === -1) return prev;
      arr[idx] = { ...arr[idx], scale: val };
      return { ...prev, [side]: arr };
    });
  };

  const deleteItem = (id) => {
    setDesigns((prev) => ({ ...prev, [side]: prev[side].filter((x) => x.id !== id) }));
    if (activeId === id) setActiveId(null);
  };

  const resetSide = () => setDesigns((prev) => ({ ...prev, [side]: [] }));

  // Export: draw shirt, then clip to path and draw each design element according to relative x,y,scale
  const exportPNG = async () => {
    const box = previewRef.current?.getBoundingClientRect();
    if (!box) return alert("Preview not ready");

    const width = 1200; // export resolution
    const height = Math.round((box.height / box.width) * width);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw shirt silhouette fill based on selected color
    const path = new Path2D(shirtPath);
    // The SVG path coordinates were built for a 300x360 viewBox (approx). We'll transform.
    const svgW = 300;
    const svgH = 360;
    const scaleX = width / svgW;
    const scaleY = height / svgH;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = selectedColor.hex;
    ctx.fill(path);
    ctx.restore();

    // Clip to shirt silhouette in canvas coordinates
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.clip(path);
    ctx.scale(1 / scaleX, 1 / scaleY); // return to canvas px coords for drawing images

    // Draw design items inside clipped region
    const items = designs[side];
    for (const it of items) {
      if (it.type === "image" && it.src) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = it.src;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res, rej) => {
          img.onload = () => {
            // Map item.x/y (relative to preview size) to canvas coords
            const centerX = width / 2 + it.x * width;
            const centerY = height / 2 + it.y * height;
            const drawW = img.width * it.scale * 0.6; // heuristic
            const drawH = img.height * it.scale * 0.6;
            ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
            res(null);
          };
          img.onerror = rej;
        });
      } else if (it.type === "text") {
        // draw text
        ctx.save();
        const centerX = width / 2 + it.x * width;
        const centerY = height / 2 + it.y * height;
        const rawSize = 48 * it.scale;
        ctx.font = `${rawSize}px Poppins, Arial`;
        ctx.fillStyle = it.color || "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(it.text || "", centerX, centerY);
        ctx.restore();
      }
    }

    ctx.restore(); // remove clip

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${product}-${side}-design.png`;
    a.click();
  };

  // Render helpers
  const renderDesign = (it) => {
    const box = previewRef.current?.getBoundingClientRect();
    const previewW = box?.width || 300;
    const previewH = box?.height || 360;
    const centerX = previewW / 2 + it.x * previewW;
    const centerY = previewH / 2 + it.y * previewH;

    const style = {
      position: "absolute",
      left: centerX,
      top: centerY,
      transform: `translate(-50%, -50%) scale(${it.scale})`,
      touchAction: "none",
      cursor: activeId === it.id ? "grabbing" : "grab",
      zIndex: activeId === it.id ? 20 : 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    return (
      <div
        key={it.id}
        style={style}
        onPointerDown={(e) => handlePointerDownItem(e, it.id)}
        onPointerMove={handlePointerMove}
        onDoubleClick={() => setActiveId(it.id)}
      >
        <div className="relative">
          {it.type === "image" && it.src && (
            <img src={it.src} alt="design" style={{ width: 180, height: "auto", maxWidth: 260, borderRadius: 6 }} />
          )}
          {it.type === "text" && (
            <div style={{ font: it.font, color: it.color }} className="select-none whitespace-pre-wrap text-center">
              {it.text}
            </div>
          )}

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(it.id);
            }}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
            title="Delete"
          >
            ×
          </button>

          {/* Scale control when active */}
          {activeId === it.id && (
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.01}
              value={it.scale}
              onChange={(e) => updateScale(it.id, Number(e.target.value))}
              className="mt-2 w-full"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">T-shirt Customizer</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Product</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="tshirt">T-Shirt</option>
              {/* add more products later */}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Side</label>
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded ${side === "front" ? "bg-indigo-600 text-white" : "bg-gray-100"}`} onClick={() => setSide("front")}>Front</button>
              <button className={`px-3 py-1 rounded ${side === "back" ? "bg-indigo-600 text-white" : "bg-gray-100"}`} onClick={() => setSide("back")}>Back</button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setSelectedColor(c)}
                  className={`w-9 h-9 rounded-full border ${selectedColor.hex === c.hex ? "ring-4 ring-offset-2 ring-indigo-300" : ""}`}
                  style={{ background: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="mb-2" />
            <label className="block text-sm font-medium mb-2">Add text</label>
            <TextAdder onAdd={(txt) => addText(txt)} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => resetSide()} className="px-3 py-2 bg-gray-200 rounded">Reset</button>
            <button onClick={() => exportPNG()} className="px-3 py-2 bg-indigo-600 text-white rounded">Export PNG</button>
          </div>

          <div className="mt-4 text-xs text-gray-500">Tip: Drag items within the shirt to reposition. Use the slider on an active item to scale. Double click an item to focus it.</div>
        </div>

        {/* Preview */}
        <div className="col-span-2 bg-white p-4 rounded shadow flex flex-col">
          <div className="mb-3 flex justify-between items-center">
            <h3 className="font-medium">Live preview</h3>
            <div className="text-sm text-gray-600">Color: {selectedColor.name}</div>
          </div>

          <div className="flex gap-6">
            <div className="relative flex-1 flex justify-center items-start">
              <div ref={previewRef} className="relative w-[420px] h-[520px] bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                {/* SVG shirt with clipPath */}
                <svg viewBox="0 0 300 360" className="absolute w-full h-full">
                  <defs>
                    <clipPath id="shirtClip">
                      <path d={shirtPath} />
                    </clipPath>
                  </defs>
                  {/* shirt shape */}
                  <g clipPath="url(#shirtClip)">
                    <rect x="0" y="0" width="300" height="360" fill={selectedColor.hex} />
                  </g>
                  {/* outline on top */}
                  <path d={shirtPath} fill="none" stroke="#111" strokeWidth="1" />
                </svg>

                {/* Design layer (positioned inside preview) */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {designs[side].map((it) => (
                    <div key={it.id} style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
                      {renderDesign(it)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side helpers: list items */}
              <div className="ml-4 w-56">
                <h4 className="text-sm font-medium mb-2">Elements</h4>
                <div className="space-y-2 max-h-[420px] overflow-auto">
                  {designs[side].length === 0 && <div className="text-sm text-gray-500">No elements</div>}
                  {designs[side].map((it) => (
                    <div key={it.id} className={`p-2 border rounded flex items-center justify-between ${activeId === it.id ? "bg-indigo-50" : ""}`}>
                      <div>
                        <div className="text-sm font-medium">{it.type === "image" ? "Image" : "Text"}</div>
                        {it.type === "text" && <div className="text-xs text-gray-600">{it.text}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setActiveId(it.id)} className="px-2 py-1 bg-gray-100 rounded">Edit</button>
                        <button onClick={() => deleteItem(it.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper component for adding text input
function TextAdder({ onAdd }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="Type text and press Add" />
      <button
        onClick={() => {
          if (!val.trim()) return alert("Enter some text");
          onAdd(val.trim());
          setVal("");
        }}
        className="px-3 py-1 bg-indigo-600 text-white rounded"
      >
        Add
      </button>
    </div>
  );
}
