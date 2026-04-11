import { useEffect, useRef } from "react";
import "./styles/Cursor.css";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let hover = false;
    let rafId: number;
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    document.addEventListener("mousemove", onMouseMove);

    function loop() {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        cursor.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`;
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    const cursorItems = Array.from(document.querySelectorAll("[data-cursor]")) as HTMLElement[];
    const overHandlers: Map<HTMLElement, (e: MouseEvent) => void> = new Map();
    const outHandlers: Map<HTMLElement, () => void> = new Map();

    cursorItems.forEach((element) => {
      const onOver = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          cursorPos.x = rect.left;
          cursorPos.y = rect.top;
          cursor.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };
      const onOut = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      };
      overHandlers.set(element, onOver);
      outHandlers.set(element, onOut);
      element.addEventListener("mouseover", onOver);
      element.addEventListener("mouseout", onOut);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      cursorItems.forEach((element) => {
        const onOver = overHandlers.get(element);
        const onOut = outHandlers.get(element);
        if (onOver) element.removeEventListener("mouseover", onOver);
        if (onOut) element.removeEventListener("mouseout", onOut);
      });
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
