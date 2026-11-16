import React, { useEffect, useRef } from 'react';

export default function ClusterCanvasBackground({ isDark = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracker for subtle interaction
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3 Discrete Cluster Centroids (Academic color accents: Blue, Emerald, Amber)
    const clusterConfig = [
      {
        baseX: 0.24,
        baseY: 0.32,
        color: isDark ? '59, 130, 246' : '37, 99, 235', // Blue #3b82f6 / #2563eb
        label: 'C1'
      },
      {
        baseX: 0.76,
        baseY: 0.36,
        color: isDark ? '16, 185, 129' : '5, 150, 105', // Emerald #10b981 / #059669
        label: 'C2'
      },
      {
        baseX: 0.48,
        baseY: 0.74,
        color: isDark ? '245, 158, 11' : '217, 119, 6', // Amber #f59e0b / #d97706
        label: 'C3'
      }
    ];

    let particles = [];
    const particlesPerCluster = 14;

    const initParticles = () => {
      particles = [];
      clusterConfig.forEach((cluster, clusterIdx) => {
        const cx = width * cluster.baseX;
        const cy = height * cluster.baseY;

        for (let i = 0; i < particlesPerCluster; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 95 + 18;
          particles.push({
            clusterIdx,
            cx,
            cy,
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 1.0,
            baseRadius: radius,
            angle,
            angularSpeed: (Math.random() - 0.5) * 0.004,
            color: cluster.color
          });
        }
      });
    };

    initParticles();

    // Render loop
    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Centroids: Subtle coordinate crosshairs & boundary rings
      clusterConfig.forEach((c, idx) => {
        const cx = width * c.baseX + Math.sin(tick * 0.008 + idx) * 10;
        const cy = height * c.baseY + Math.cos(tick * 0.009 + idx) * 10;

        // Centroid point
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.color}, ${isDark ? 0.7 : 0.5})`;
        ctx.fill();

        // Delicate coordinate crosshair at centroid
        ctx.strokeStyle = `rgba(${c.color}, ${isDark ? 0.25 : 0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx + 6, cy);
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx, cy + 6);
        ctx.stroke();

        // Delicate dashed boundary ring (Voronoi/partition bound)
        const ringRadius = 78 + Math.sin(tick * 0.015 + idx) * 8;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${c.color}, ${isDark ? 0.08 : 0.06})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.angularSpeed;

        const cluster = clusterConfig[p.clusterIdx];
        const dynamicCx = width * cluster.baseX + Math.sin(tick * 0.008 + p.clusterIdx) * 10;
        const dynamicCy = height * cluster.baseY + Math.cos(tick * 0.009 + p.clusterIdx) * 10;

        p.x = dynamicCx + Math.cos(p.angle) * p.baseRadius + p.vx * 15;
        p.y = dynamicCy + Math.sin(p.angle) * p.baseRadius + p.vy * 15;

        // Subtle mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 110) {
          const force = (110 - distToMouse) / 110;
          p.x += (dx / distToMouse) * force * 14;
          p.y += (dy / distToMouse) * force * 14;
        }

        // Crisp particle dot without blur
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${isDark ? 0.55 : 0.4})`;
        ctx.fill();

        // Draw fine connecting edges within cluster
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p.clusterIdx === p2.clusterIdx) {
            const edgeDx = p.x - p2.x;
            const edgeDy = p.y - p2.y;
            const edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
            if (edgeDist < 75) {
              const alpha = (1 - edgeDist / 75) * (isDark ? 0.16 : 0.12);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* HTML5 Canvas with fine particle simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40"
      />

      {/* Subtle Technical Dot Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.14] dark:opacity-[0.09]"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(rgba(244, 244, 245, 0.4) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15, 23, 42, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
