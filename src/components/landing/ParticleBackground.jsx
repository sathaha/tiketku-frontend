import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ===== PARTICLE FIELD =====
function Particles({ count = 280 }) {
  const ref = useRef();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#fbbf24'), // amber-400
      new THREE.Color('#f59e0b'), // amber-500
      new THREE.Color('#fef3c7'), // amber-100 (cream)
      new THREE.Color('#d97706'), // amber-600
      new THREE.Color('#ffffff'), // putih
    ];

    for (let i = 0; i < count; i++) {
      // Sebar di volume luas, area paling dalam
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array;
    const pointer = state.pointer;

    // Gerak float pelan + mouse interaction halus
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += Math.sin(t * 0.3 + i) * 0.0012;
      pos[i] += Math.cos(t * 0.2 + i) * 0.0008;

      // Mouse attraction sangat halus
      if (pointer) {
        pos[i] += (pointer.x * 1.5 - pos[i] * 0.001) * 0.001;
        pos[i + 1] += (pointer.y * 1.0 - pos[i + 1] * 0.001) * 0.001;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    // Rotasi global sangat lambat
    ref.current.rotation.y = t * 0.025;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ===== GLOW SPOTS (bloom ambiance) =====
function GlowSpots() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      child.position.x = Math.sin(t * 0.12 + i * 2.1) * 4.5;
      child.position.y = Math.cos(t * 0.18 + i * 1.4) * 2.2;
    });
  });

  return (
    <group ref={ref}>
      {[
        { pos: [-7, 2, -5], color: '#f59e0b', size: 3 },
        { pos: [7, -2, -6], color: '#fbbf24', size: 2.5 },
        { pos: [0, 4, -7], color: '#fef3c7', size: 2 },
      ].map((g, i) => (
        <mesh key={i} position={g.pos}>
          <sphereGeometry args={[g.size, 16, 16]} />
          <meshBasicMaterial
            color={g.color}
            transparent
            opacity={0.06}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ===== MAIN EXPORT =====
export default function ParticleBackground({ reducedMotion = false }) {
  if (reducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 top-1/4 w-[34rem] h-[34rem] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -left-40 bottom-1/4 w-96 h-96 rounded-full bg-amber-700/8 blur-3xl" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Particles count={280} />
        <GlowSpots />
      </Canvas>
    </div>
  );
}