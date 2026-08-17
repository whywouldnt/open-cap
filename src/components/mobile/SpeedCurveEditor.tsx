import React, { useRef, useEffect, useState } from 'react';
import { SpeedCurve, SpeedCurvePoint } from '@/types/project';
import { SpeedCurveEngine } from '@/engine/speed/SpeedCurveEngine';

interface SpeedCurveEditorProps {
  curve: SpeedCurve;
  onChange: (updatedCurve: SpeedCurve) => void;
}

export const SpeedCurveEditor: React.FC<SpeedCurveEditorProps> = ({
  curve,
  onChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const isDragging = useRef(false);

  // Redraw Curve Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear
    ctx.fillStyle = '#121216';
    ctx.fillRect(0, 0, width, height);

    // 2. Grid lines & Speed Labels (0.1x, 1x, 2x, 5x, 10x)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    const gridSpeeds = [1.0, 2.0, 5.0, 10.0];
    const maxSpeed = 10.0;
    const minSpeed = 0.1;

    for (const sp of gridSpeeds) {
      const y = height - (Math.log10(sp / minSpeed) / Math.log10(maxSpeed / minSpeed)) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = sp === 1.0 ? '#00f0ff' : '#71717a';
      ctx.font = '9px monospace';
      ctx.fillText(`${sp}x`, 6, y - 3);
    }

    // 3. Draw Spline Curve
    ctx.beginPath();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const speed = SpeedCurveEngine.getSpeedAtRatio(curve.points, ratio);
      const x = ratio * width;
      const speedNorm =
        Math.log10(Math.max(minSpeed, Math.min(maxSpeed, speed)) / minSpeed) /
        Math.log10(maxSpeed / minSpeed);
      const y = height - speedNorm * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 4. Fill Area Under Curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // 5. Draw Interactive Control Points
    curve.points.forEach((pt, idx) => {
      const x = pt.timeRatio * width;
      const speedNorm =
        Math.log10(Math.max(minSpeed, Math.min(maxSpeed, pt.speed)) / minSpeed) /
        Math.log10(maxSpeed / minSpeed);
      const y = height - speedNorm * height;

      const isSelected = activePointIndex === idx;

      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#fbbf24' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [curve, activePointIndex]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const maxSpeed = 10.0;
    const minSpeed = 0.1;

    // Check if clicked close to an existing point
    let foundIndex = -1;
    curve.points.forEach((pt, idx) => {
      const px = pt.timeRatio * width;
      const speedNorm =
        Math.log10(Math.max(minSpeed, Math.min(maxSpeed, pt.speed)) / minSpeed) /
        Math.log10(maxSpeed / minSpeed);
      const py = height - speedNorm * height;

      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < 20) {
        foundIndex = idx;
      }
    });

    if (foundIndex !== -1) {
      setActivePointIndex(foundIndex);
      isDragging.current = true;
    } else {
      // Add new point if tapped in middle
      const newRatio = Math.max(0.05, Math.min(0.95, clickX / width));
      const speedNorm = (height - clickY) / height;
      const newSpeed = minSpeed * Math.pow(maxSpeed / minSpeed, Math.max(0, Math.min(1, speedNorm)));

      const updatedPoints = [...curve.points, { timeRatio: newRatio, speed: newSpeed }].sort(
        (a, b) => a.timeRatio - b.timeRatio
      );

      onChange({
        preset: 'custom',
        points: updatedPoints,
      });
      setActivePointIndex(updatedPoints.findIndex((p) => Math.abs(p.timeRatio - newRatio) < 0.01));
      isDragging.current = true;
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDragging.current || activePointIndex === null) return;
      const moveRect = canvas.getBoundingClientRect();
      const moveX = moveEvent.clientX - moveRect.left;
      const moveY = moveEvent.clientY - moveRect.top;

      const updatedRatio =
        activePointIndex === 0
          ? 0.0
          : activePointIndex === curve.points.length - 1
          ? 1.0
          : Math.max(0.02, Math.min(0.98, moveX / width));

      const moveSpeedNorm = (height - moveY) / height;
      const updatedSpeed =
        minSpeed * Math.pow(maxSpeed / minSpeed, Math.max(0, Math.min(1, moveSpeedNorm)));

      const newPts = curve.points.map((pt, i) => {
        if (i === activePointIndex) {
          return {
            timeRatio: updatedRatio,
            speed: Math.round(updatedSpeed * 10) / 10,
          };
        }
        return pt;
      });

      onChange({
        preset: 'custom',
        points: newPts,
      });
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative w-full aspect-[16/9] max-h-[190px] rounded-xl overflow-hidden border border-white/10 shadow-inner bg-[#121216]">
        <canvas
          ref={canvasRef}
          width={360}
          height={190}
          onPointerDown={handlePointerDown}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>
      <span className="text-[10px] text-zinc-400 text-center">
        Noktaları yukarı/aşağı sürükleyerek hızı ayarlayın veya boş yere dokunarak yeni nokta ekleyin.
      </span>
    </div>
  );
};
