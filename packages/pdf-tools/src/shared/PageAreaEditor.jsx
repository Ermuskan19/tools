import { useRef, useState } from 'react';
import './editor.css';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Convert a box from display space (top-left origin, rotation applied) into
 * pdf-lib drawing space (bottom-left origin, unrotated page).
 * Returns { x, y, width, height } in PDF points.
 */
export function displayBoxToPdf(page, box) {
  const rot = page.rotation || 0;
  const W = page.width;
  const H = page.height;
  const toPdf = (dx, dy) => {
    switch (rot) {
      case 90:
        return { x: dy, y: dx };
      case 180:
        return { x: W - dx, y: dy };
      case 270:
        return { x: H - dy, y: W - dx };
      default:
        return { x: dx, y: H - dy };
    }
  };
  const corners = [
    toPdf(box.x, box.y),
    toPdf(box.x + box.w, box.y),
    toPdf(box.x, box.y + box.h),
    toPdf(box.x + box.w, box.y + box.h)
  ];
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY
  };
}

/** Anchor point (pdf space) of a display-space box — its display top-left corner. */
export function displayAnchorToPdf(page, box) {
  const rot = page.rotation || 0;
  const W = page.width;
  const H = page.height;
  switch (rot) {
    case 90:
      return { x: box.y, y: box.x };
    case 180:
      return { x: W - box.x, y: box.y };
    case 270:
      return { x: H - box.y, y: W - box.x };
    default:
      return { x: box.x, y: H - box.y };
  }
}

/**
 * Convert a rect in pdf-lib space (bottom-left origin, unrotated) into a
 * display-space box (top-left origin, rotation applied).
 */
export function pdfRectToDisplay(page, rect) {
  const rot = page.rotation || 0;
  const W = page.width;
  const H = page.height;
  const toDisplay = (px, py) => {
    switch (rot) {
      case 90:
        return { x: py, y: px };
      case 180:
        return { x: W - px, y: py };
      case 270:
        return { x: W - py, y: H - px };
      default:
        return { x: px, y: H - py };
    }
  };
  const corners = [
    toDisplay(rect.x, rect.y),
    toDisplay(rect.x + rect.width, rect.y),
    toDisplay(rect.x, rect.y + rect.height),
    toDisplay(rect.x + rect.width, rect.y + rect.height)
  ];
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    w: Math.max(...xs) - minX,
    h: Math.max(...ys) - minY
  };
}

/**
 * Interactive editor: renders page previews, lets the user drag out boxes,
 * move them and resize them. Boxes live in display space (PDF points).
 */
export const PageAreaEditor = ({
  pages,
  boxes,
  onChange,
  overlay,
  color = '#111827',
  hint = 'Drag on a page to draw a box. Drag a box to move it, use the corner to resize.',
  minSize = 6,
  maxWidth = 520
}) => {
  const [draft, setDraft] = useState(null);
  const actionRef = useRef(null);
  const boxesRef = useRef(boxes);
  const pagesRef = useRef(pages);
  const onChangeRef = useRef(onChange);
  const draftRef = useRef(draft);
  boxesRef.current = boxes;
  pagesRef.current = pages;
  onChangeRef.current = onChange;
  draftRef.current = draft;

  const scaleOf = (page) => Math.min(1, maxWidth / page.width);

  const localPoint = (page, el, clientX, clientY) => {
    const rect = el.getBoundingClientRect();
    const scale = scaleOf(page);
    // The element is laid out at page.width * scale CSS pixels wide.
    const sx = page.width / (rect.width || 1);
    const sy = page.height / (rect.height || 1);
    return {
      x: clamp((clientX - rect.left) * sx, 0, page.width),
      y: clamp((clientY - rect.top) * sy, 0, page.height),
      scale
    };
  };

  const detach = () => {
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
  };

  const handleMove = (e) => {
    const a = actionRef.current;
    if (!a) return;
    if (a.type === 'create') {
      const p = localPoint(a.page, a.el, e.clientX, e.clientY);
      setDraft({
        page: a.page.index,
        x: Math.min(a.startX, p.x),
        y: Math.min(a.startY, p.y),
        w: Math.abs(p.x - a.startX),
        h: Math.abs(p.y - a.startY)
      });
      return;
    }
    const list = boxesRef.current;
    const box = list.find((b) => b.id === a.boxId);
    if (!box) return;
    const page = a.page;
    if (a.type === 'move') {
      const p = localPoint(page, a.el, e.clientX, e.clientY);
      const nx = clamp(p.x - a.offsetX, 0, Math.max(0, page.width - box.w));
      const ny = clamp(p.y - a.offsetY, 0, Math.max(0, page.height - box.h));
      onChangeRef.current(list.map((b) => (b.id === box.id ? { ...b, x: nx, y: ny } : b)));
    } else {
      const p = localPoint(page, a.el, e.clientX, e.clientY);
      const right = clamp(p.x - a.startX + a.orig.w, a.orig.x + minSize, page.width);
      const bottom = clamp(p.y - a.startY + a.orig.h, a.orig.y + minSize, page.height);
      onChangeRef.current(
        list.map((b) => (b.id === box.id ? { ...b, w: right - a.orig.x, h: bottom - a.orig.y } : b))
      );
    }
  };

  const handleUp = () => {
    const a = actionRef.current;
    detach();
    actionRef.current = null;
    if (a && a.type === 'create') {
      const page = pagesRef.current.find((p) => p.index === a.page.index);
      const d = draftRef.current;
      if (page && d) {
        let { x, y, w, h } = d;
        if (w < minSize || h < minSize) {
          w = Math.max(w, 150);
          h = Math.max(h, 40);
          x = clamp(x, 0, Math.max(0, page.width - w));
          y = clamp(y, 0, Math.max(0, page.height - h));
        }
        onChangeRef.current([
          ...boxesRef.current,
          { id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, page: page.index, x, y, w, h }
        ]);
      }
      setDraft(null);
    }
  };

  const beginCreate = (page, e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const p = localPoint(page, e.currentTarget, e.clientX, e.clientY);
    actionRef.current = { type: 'create', page, el: e.currentTarget, startX: p.x, startY: p.y };
    setDraft({ page: page.index, x: p.x, y: p.y, w: 0, h: 0 });
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const beginMove = (e, box) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const page = pagesRef.current.find((p) => p.index === box.page);
    const el = e.currentTarget.closest('.pae-page');
    if (!page || !el) return;
    const p = localPoint(page, el, e.clientX, e.clientY);
    actionRef.current = {
      type: 'move',
      boxId: box.id,
      page,
      el,
      offsetX: p.x - box.x,
      offsetY: p.y - box.y
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const beginResize = (e, box) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const page = pagesRef.current.find((p) => p.index === box.page);
    const el = e.currentTarget.closest('.pae-page');
    if (!page || !el) return;
    const p = localPoint(page, el, e.clientX, e.clientY);
    actionRef.current = {
      type: 'resize',
      boxId: box.id,
      page,
      el,
      startX: p.x,
      startY: p.y,
      orig: { ...box }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const updateBox = (id, patch) =>
    onChangeRef.current(boxesRef.current.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const removeBox = (id) => onChangeRef.current(boxesRef.current.filter((b) => b.id !== id));

  const renderBox = (box) => {
    const page = pages.find((p) => p.index === box.page);
    if (!page) return null;
    const scale = scaleOf(page);
    return (
      <div
        key={box.id}
        className="pae-box"
        style={{
          left: box.x * scale,
          top: box.y * scale,
          width: box.w * scale,
          height: box.h * scale,
          borderColor: color
        }}
        onPointerDown={(e) => beginMove(e, box)}
        title="Drag to move"
      >
        {overlay ? overlay(box, page) : null}
        <span
          className="pae-handle"
          style={{ borderColor: color }}
          onPointerDown={(e) => beginResize(e, box)}
          title="Drag to resize"
        />
        <button
          type="button"
          className="pae-remove"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removeBox(box.id);
          }}
          aria-label="Remove box"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="pae">
      <p className="form-note">{hint}</p>
      <div className="pae-pages">
        {pages.map((page) => {
          const scale = scaleOf(page);
          return (
            <div key={page.index} className="pae-page-wrap">
              <div className="pae-page-label">Page {page.index}</div>
              <div
                className="pae-page"
                style={{ width: page.width * scale, height: page.height * scale }}
                onPointerDown={(e) => beginCreate(page, e)}
              >
                <img src={page.url} alt={`Page ${page.index}`} draggable={false} />
                {boxes.filter((b) => b.page === page.index).map(renderBox)}
                {draft && draft.page === page.index && (
                  <div
                    className="pae-box pae-draft"
                    style={{
                      left: draft.x * scale,
                      top: draft.y * scale,
                      width: draft.w * scale,
                      height: draft.h * scale,
                      borderColor: color
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {boxes.length > 0 && (
        <div className="pae-list">
          <div className="pae-list-head">
            <span>Box</span>
            <span>Page</span>
            <span>X</span>
            <span>Y</span>
            <span>W</span>
            <span>H</span>
            <span />
          </div>
          {boxes.map((box, i) => (
            <div key={box.id} className="pae-row">
              <span className="pae-idx">{i + 1}</span>
              <input
                className="tool-input"
                type="number"
                min="1"
                max={pages.length}
                value={box.page}
                onChange={(e) =>
                  updateBox(box.id, { page: clamp(Number(e.target.value) || 1, 1, pages.length) })
                }
              />
              <input
                className="tool-input"
                type="number"
                value={Math.round(box.x)}
                onChange={(e) => updateBox(box.id, { x: Number(e.target.value) || 0 })}
              />
              <input
                className="tool-input"
                type="number"
                value={Math.round(box.y)}
                onChange={(e) => updateBox(box.id, { y: Number(e.target.value) || 0 })}
              />
              <input
                className="tool-input"
                type="number"
                min="1"
                value={Math.round(box.w)}
                onChange={(e) => updateBox(box.id, { w: Math.max(1, Number(e.target.value) || 1) })}
              />
              <input
                className="tool-input"
                type="number"
                min="1"
                value={Math.round(box.h)}
                onChange={(e) => updateBox(box.id, { h: Math.max(1, Number(e.target.value) || 1) })}
              />
              <button className="icon-btn danger" onClick={() => removeBox(box.id)} aria-label="Delete box">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageAreaEditor;
