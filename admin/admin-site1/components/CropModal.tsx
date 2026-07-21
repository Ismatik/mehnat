"use client";

// Редактор обрезки изображения перед загрузкой. Пропорция рамки задаётся
// параметром aspect (ширина/высота) по типу поля. Пользователь двигает и
// масштабирует изображение, видит область кадра; на сервер уходит уже
// обрезанное (canvas → blob). Без внешних зависимостей.

import { useEffect, useRef, useState } from "react";

const FRAME_MAX = 360; // макс. сторона рамки в пикселях интерфейса
const MAX_OUT = 1600; // ограничение размера итогового файла по длинной стороне

function extFor(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "png";
}

export default function CropModal({
  file,
  aspect,
  onCancel,
  onConfirm,
}: {
  file: File;
  aspect: number;
  onCancel: () => void;
  onConfirm: (result: File) => void;
}) {
  const [src, setSrc] = useState<string>("");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const frameW = aspect >= 1 ? FRAME_MAX : Math.round(FRAME_MAX * aspect);
  const frameH = aspect >= 1 ? Math.round(FRAME_MAX / aspect) : FRAME_MAX;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!img) {
    return (
      <div className="overlay">
        <div className="crop-box"><div className="center-note">Загрузка изображения…</div></div>
      </div>
    );
  }

  const baseScale = Math.max(frameW / img.naturalWidth, frameH / img.naturalHeight);
  const bz = baseScale * zoom;
  const dispW = img.naturalWidth * bz;
  const dispH = img.naturalHeight * bz;
  const maxX = Math.max(0, (dispW - frameW) / 2);
  const maxY = Math.max(0, (dispH - frameH) / 2);
  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
  const ox = clamp(off.x, maxX);
  const oy = clamp(off.y, maxY);
  const imgLeft = frameW / 2 - dispW / 2 + ox;
  const imgTop = frameH / 2 - dispH / 2 + oy;

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox, oy };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setOff({ x: drag.current.ox + (e.clientX - drag.current.sx), y: drag.current.oy + (e.clientY - drag.current.sy) });
  }
  function onPointerUp() {
    drag.current = null;
  }
  function onWheel(e: React.WheelEvent) {
    setZoom((z) => Math.max(1, Math.min(5, z - e.deltaY * 0.0015)));
  }

  function confirm() {
    const cropWsrc = frameW / bz;
    const cropHsrc = frameH / bz;
    const cropXsrc = img!.naturalWidth / 2 - (frameW / 2 + ox) / bz;
    const cropYsrc = img!.naturalHeight / 2 - (frameH / 2 + oy) / bz;

    let outW: number, outH: number;
    if (aspect >= 1) {
      outW = Math.min(Math.round(cropWsrc), MAX_OUT);
      outH = Math.round(outW / aspect);
    } else {
      outH = Math.min(Math.round(cropHsrc), MAX_OUT);
      outW = Math.round(outH * aspect);
    }
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;
    const type = file.type === "image/gif" ? "image/png" : file.type || "image/png";
    if (type === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, outW, outH);
    }
    ctx.drawImage(img!, cropXsrc, cropYsrc, cropWsrc, cropHsrc, 0, 0, outW, outH);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const name = `crop_${Date.now()}.${extFor(type)}`;
        onConfirm(new File([blob], name, { type }));
      },
      type,
      0.9
    );
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="crop-box">
        <div className="crop-head">
          <h2>Обрезка изображения</h2>
          <div className="spacer" />
          <button type="button" className="close-x" onClick={onCancel} aria-label="Закрыть">×</button>
        </div>
        <div className="crop-body">
          <div className="hint" style={{ marginBottom: 12 }}>
            Перетащите изображение и настройте масштаб — в кадр попадёт выделенная область (пропорция {aspect >= 1 ? `${aspect.toFixed(2)}:1` : `1:${(1 / aspect).toFixed(2)}`}).
          </div>
          <div
            className="crop-frame"
            style={{ width: frameW, height: frameH, touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={onWheel}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{ position: "absolute", left: imgLeft, top: imgTop, width: dispW, height: dispH, maxWidth: "none", userSelect: "none", cursor: "grab" }}
            />
          </div>
          <div className="crop-zoom">
            <span className="muted" style={{ fontSize: 12 }}>Масштаб</span>
            <input type="range" min={1} max={5} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ flex: 1 }} />
          </div>
        </div>
        <div className="crop-foot">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Отмена</button>
          <button type="button" className="btn btn-primary" onClick={confirm}>Обрезать и загрузить</button>
        </div>
      </div>
    </div>
  );
}
