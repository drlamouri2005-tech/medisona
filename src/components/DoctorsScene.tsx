import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * DoctorsScene
 * ------------
 * A playful crew of procedurally-built 3D doctors for the auth portal.
 *
 * Behaviours:
 *  - Idle: gentle bobbing, breathing, subtle sway, random blinking.
 *  - Cursor: heads, pupils and bodies turn to follow the user's cursor anywhere on the page.
 *  - Typing (name/email): the crew leans in and looks down toward the form.
 *  - Password: everyone raises their hands to cover their eyes, smiles,
 *    and shyly turns their bodies away until the field loses focus.
 */

export type AuthFieldFocus = "none" | "name" | "email" | "password";

interface DoctorsSceneProps {
  focusedField: AuthFieldFocus;
  isDarkMode: boolean;
}

type MouseRef = React.MutableRefObject<{ x: number; y: number }>;

interface DoctorConfig {
  skin: string;
  skinShadow: string;
  hair: string;
  hairStyle: "cap" | "bun" | "surgical" | "buzz";
  scrub: string;
  scrubDark: string;
  pants: string;
  hasCoat: boolean;
  hasStethoscope: boolean;
  hasMask: boolean;
  scale: number;
  position: [number, number, number];
  baseYaw: number;
  phase: number;
  turnAwayDir: 1 | -1;
}

const clamp = THREE.MathUtils.clamp;
const damp = THREE.MathUtils.damp;

/* ---------------------------------- Doctor ---------------------------------- */

const Doctor: React.FC<{
  config: DoctorConfig;
  mouseRef: MouseRef;
  focusRef: React.MutableRefObject<AuthFieldFocus>;
}> = ({ config, mouseRef, focusRef }) => {
  const rootRef = useRef<THREE.Group>(null!);
  const torsoRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const shoulderLRef = useRef<THREE.Group>(null!);
  const shoulderRRef = useRef<THREE.Group>(null!);
  const elbowLRef = useRef<THREE.Group>(null!);
  const elbowRRef = useRef<THREE.Group>(null!);
  const pupilLRef = useRef<THREE.Mesh>(null!);
  const pupilRRef = useRef<THREE.Mesh>(null!);
  const eyeLRef = useRef<THREE.Group>(null!);
  const eyeRRef = useRef<THREE.Group>(null!);
  const mouthRef = useRef<THREE.Mesh>(null!);
  const browLRef = useRef<THREE.Mesh>(null!);
  const browRRef = useRef<THREE.Mesh>(null!);

  // Blink scheduling
  const blinkRef = useRef({ nextAt: 1.5 + Math.random() * 3, closingUntil: -1 });

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: config.skin, roughness: 0.55 }),
      skinShadow: new THREE.MeshStandardMaterial({ color: config.skinShadow, roughness: 0.6 }),
      hair: new THREE.MeshStandardMaterial({ color: config.hair, roughness: 0.65 }),
      scrub: new THREE.MeshStandardMaterial({ color: config.scrub, roughness: 0.75 }),
      scrubDark: new THREE.MeshStandardMaterial({ color: config.scrubDark, roughness: 0.8 }),
      pants: new THREE.MeshStandardMaterial({ color: config.pants, roughness: 0.8 }),
      coat: new THREE.MeshStandardMaterial({ color: "#f6f6f3", roughness: 0.7 }),
      shoe: new THREE.MeshStandardMaterial({ color: "#e9e9ec", roughness: 0.5 }),
      eyeWhite: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.25 }),
      pupil: new THREE.MeshStandardMaterial({ color: "#2b2118", roughness: 0.3 }),
      mouth: new THREE.MeshStandardMaterial({ color: "#7a4a3d", roughness: 0.5 }),
      stetho: new THREE.MeshStandardMaterial({ color: "#42566b", roughness: 0.4, metalness: 0.35 }),
      mask: new THREE.MeshStandardMaterial({ color: "#a8cde6", roughness: 0.85 }),
      cap: new THREE.MeshStandardMaterial({ color: "#7fb3d8", roughness: 0.8 }),
    }),
    [config]
  );

  const sleeveMat = config.hasCoat ? mats.coat : mats.scrub;
  // Scrubs = short sleeves (skin forearm), coat = long sleeves
  const forearmMat = config.hasCoat ? mats.coat : mats.skin;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const focus = focusRef.current;
    const covering = focus === "password";
    const typing = focus === "email" || focus === "name";
    const phase = config.phase;

    /* ------------------------------ idle motion ------------------------------ */
    rootRef.current.position.y = Math.sin(t * 1.35 + phase) * 0.028;
    const sway = Math.sin(t * 0.85 + phase) * 0.018;
    torsoRef.current.scale.y = 1 + Math.sin(t * 1.9 + phase) * 0.012;

    /* ---------------------------- cursor tracking ---------------------------- */
    // Map the page-wide cursor to a virtual point floating in front of the crew.
    let tx = mouseRef.current.x * 4.4;
    let ty = 1.55 + mouseRef.current.y * 2.3;
    if (typing) {
      // Look down toward the form on the right side of the screen.
      tx = 3.4;
      ty = 0.45;
    }

    const headAbsY = 1.7 * config.scale;
    const docX = config.position[0];
    const docZ = config.position[2];
    const dx = tx - docX;
    const dz = 4.6 - docZ;
    const dy = ty - headAbsY;
    const dist = Math.hypot(dx, dz);

    let targetHeadYaw = clamp(Math.atan2(dx, dz), -0.72, 0.72);
    let targetHeadPitch = clamp(Math.atan2(dy, dist), -0.32, 0.5);
    let targetBodyYaw = clamp(targetHeadYaw * 0.5, -0.55, 0.55);
    let leanX = typing ? 0.07 : 0.02;

    /* ------------------------- password cover-up pose ------------------------ */
    let shLX = 0, shRX = 0, shLZ = 0.14, shRZ = -0.14, elbL = -0.12, elbR = -0.12;
    let smileScale = 1;
    let eyeOpen = 1;
    let browRaise = 0;

    if (covering) {
      // Hands fly up over the eyes, elbows bent, sweet shy turn-away.
      shLX = -1.75;
      shRX = -1.75;
      shLZ = 0.52;
      shRZ = -0.52;
      elbL = -1.7;
      elbR = -1.7;
      targetHeadYaw = config.turnAwayDir * 0.42;
      targetHeadPitch = -0.3;
      targetBodyYaw = config.turnAwayDir * 0.65;
      leanX = 0.03;
      smileScale = 1.45;
      eyeOpen = 0.08;
      browRaise = 0.02;
    } else if (typing) {
      smileScale = 1.15;
      browRaise = 0.012;
    }

    /* ------------------------------- damping --------------------------------- */
    const head = headRef.current;
    head.rotation.y = damp(head.rotation.y, targetHeadYaw, 6.5, delta);
    head.rotation.x = damp(head.rotation.x, -targetHeadPitch, 6.5, delta);
    head.rotation.z = damp(head.rotation.z, covering ? config.turnAwayDir * 0.12 : Math.sin(t * 0.7 + phase) * 0.03, 6, delta);

    rootRef.current.rotation.y = damp(rootRef.current.rotation.y, config.baseYaw + targetBodyYaw, 5, delta);
    rootRef.current.rotation.z = damp(rootRef.current.rotation.z, sway, 5, delta);
    torsoRef.current.rotation.x = damp(torsoRef.current.rotation.x, leanX, 5, delta);

    // Arms — snappier so the "peek-a-boo" feels responsive
    const sL = shoulderLRef.current, sR = shoulderRRef.current;
    const armSwing = Math.sin(t * 1.35 + phase) * 0.04;
    sL.rotation.x = damp(sL.rotation.x, shLX + (covering ? 0 : armSwing), 10, delta);
    sR.rotation.x = damp(sR.rotation.x, shRX + (covering ? 0 : -armSwing), 10, delta);
    sL.rotation.z = damp(sL.rotation.z, shLZ, 10, delta);
    sR.rotation.z = damp(sR.rotation.z, shRZ, 10, delta);
    elbowLRef.current.rotation.x = damp(elbowLRef.current.rotation.x, elbL, 10, delta);
    elbowRRef.current.rotation.x = damp(elbowRRef.current.rotation.x, elbR, 10, delta);

    /* ------------------------------ pupils ----------------------------------- */
    const pupilRange = covering ? 0 : 0.02;
    const px = clamp(dx * 0.006, -pupilRange, pupilRange);
    const py = clamp(dy * 0.006, -pupilRange * 0.8, pupilRange * 0.8);
    pupilLRef.current.position.set(px, py, 0.036);
    pupilRRef.current.position.set(px, py, 0.036);

    /* ------------------------------- blinking -------------------------------- */
    const blink = blinkRef.current;
    if (!covering && t > blink.nextAt) {
      blink.closingUntil = t + 0.13;
      blink.nextAt = t + 2.2 + Math.random() * 3.4;
    }
    const blinkTarget = covering ? eyeOpen : t < blink.closingUntil ? 0.08 : 1;
    eyeLRef.current.scale.y = damp(eyeLRef.current.scale.y, blinkTarget, 26, delta);
    eyeRRef.current.scale.y = damp(eyeRRef.current.scale.y, blinkTarget, 26, delta);

    /* ------------------------------ expression ------------------------------- */
    const m = mouthRef.current;
    const s = damp(m.scale.x, smileScale, 8, delta);
    m.scale.set(s, 1 + (s - 1) * 0.7, 1);
    browLRef.current.position.y = damp(browLRef.current.position.y, 0.275 + browRaise, 8, delta);
    browRRef.current.position.y = damp(browRRef.current.position.y, 0.275 + browRaise, 8, delta);
  });

  const armX = 0.305;

  return (
    <group ref={rootRef} position={config.position} scale={config.scale} rotation={[0, config.baseYaw, 0]}>
      {/* ------------------------------- legs ------------------------------- */}
      <mesh position={[-0.13, 0.47, 0]} material={mats.pants}>
        <capsuleGeometry args={[0.095, 0.5, 6, 14]} />
      </mesh>
      <mesh position={[0.13, 0.47, 0]} material={mats.pants}>
        <capsuleGeometry args={[0.095, 0.5, 6, 14]} />
      </mesh>
      {/* shoes */}
      <mesh position={[-0.13, 0.075, 0.045]} scale={[1, 0.62, 1.45]} material={mats.shoe}>
        <sphereGeometry args={[0.105, 20, 14]} />
      </mesh>
      <mesh position={[0.13, 0.075, 0.045]} scale={[1, 0.62, 1.45]} material={mats.shoe}>
        <sphereGeometry args={[0.105, 20, 14]} />
      </mesh>

      {/* ------------------------------- torso ------------------------------ */}
      <group ref={torsoRef} position={[0, 0.82, 0]}>
        {/* scrub top / coat body */}
        <mesh position={[0, 0.32, 0]} material={config.hasCoat ? mats.coat : mats.scrub}>
          <capsuleGeometry args={[0.26, 0.4, 8, 18]} />
        </mesh>
        {config.hasCoat ? (
          <>
            {/* coat skirt */}
            <mesh position={[0, 0.02, 0]} material={mats.coat}>
              <cylinderGeometry args={[0.285, 0.335, 0.34, 20]} />
            </mesh>
            {/* scrub V peeking out of the coat collar */}
            <mesh position={[0, 0.52, 0.22]} rotation={[-0.25, 0, 0]} material={mats.scrub}>
              <boxGeometry args={[0.13, 0.11, 0.05]} />
            </mesh>
            {/* coat pocket */}
            <mesh position={[-0.16, 0.2, 0.26]} material={mats.scrubDark}>
              <boxGeometry args={[0.11, 0.09, 0.012]} />
            </mesh>
          </>
        ) : (
          <>
            {/* scrub pocket */}
            <mesh position={[0.12, 0.28, 0.245]} rotation={[-0.08, 0, 0]} material={mats.scrubDark}>
              <boxGeometry args={[0.12, 0.1, 0.014]} />
            </mesh>
            {/* scrub collar V */}
            <mesh position={[0, 0.55, 0.2]} rotation={[-0.3, 0, 0]} material={mats.skin}>
              <boxGeometry args={[0.11, 0.09, 0.05]} />
            </mesh>
          </>
        )}

        {/* stethoscope */}
        {config.hasStethoscope && (
          <group position={[0, 0.6, 0.08]} rotation={[1.3, 0, 0]}>
            <mesh material={mats.stetho}>
              <torusGeometry args={[0.135, 0.011, 10, 28]} />
            </mesh>
            <mesh position={[0.09, -0.11, 0.11]} rotation={[0.4, 0, 0.2]} material={mats.stetho}>
              <cylinderGeometry args={[0.028, 0.028, 0.018, 14]} />
            </mesh>
          </group>
        )}

        {/* ------------------------------- arms ------------------------------ */}
        {/* left arm */}
        <group ref={shoulderLRef} position={[-armX, 0.52, 0]}>
          <mesh position={[0, -0.13, 0]} material={sleeveMat}>
            <capsuleGeometry args={[0.075, 0.18, 6, 12]} />
          </mesh>
          <group ref={elbowLRef} position={[0, -0.27, 0]}>
            <mesh position={[0, -0.11, 0]} material={forearmMat}>
              <capsuleGeometry args={[0.06, 0.16, 6, 12]} />
            </mesh>
            <mesh position={[0, -0.245, 0]} scale={[1, 1.15, 0.72]} material={mats.skin}>
              <sphereGeometry args={[0.082, 18, 14]} />
            </mesh>
          </group>
        </group>
        {/* right arm */}
        <group ref={shoulderRRef} position={[armX, 0.52, 0]}>
          <mesh position={[0, -0.13, 0]} material={sleeveMat}>
            <capsuleGeometry args={[0.075, 0.18, 6, 12]} />
          </mesh>
          <group ref={elbowRRef} position={[0, -0.27, 0]}>
            <mesh position={[0, -0.11, 0]} material={forearmMat}>
              <capsuleGeometry args={[0.06, 0.16, 6, 12]} />
            </mesh>
            <mesh position={[0, -0.245, 0]} scale={[1, 1.15, 0.72]} material={mats.skin}>
              <sphereGeometry args={[0.082, 18, 14]} />
            </mesh>
          </group>
        </group>

        {/* ------------------------------- head ------------------------------ */}
        <group ref={headRef} position={[0, 0.82, 0]}>
          {/* neck */}
          <mesh position={[0, 0.0, 0]} material={mats.skinShadow}>
            <cylinderGeometry args={[0.07, 0.08, 0.14, 14]} />
          </mesh>
          {/* skull */}
          <mesh position={[0, 0.18, 0]} scale={[0.96, 1.04, 0.92]} material={mats.skin}>
            <sphereGeometry args={[0.24, 28, 22]} />
          </mesh>
          {/* ears */}
          <mesh position={[-0.225, 0.17, -0.01]} material={mats.skin}>
            <sphereGeometry args={[0.045, 12, 10]} />
          </mesh>
          <mesh position={[0.225, 0.17, -0.01]} material={mats.skin}>
            <sphereGeometry args={[0.045, 12, 10]} />
          </mesh>

          {/* hair — caps sit high so the fringe stays above the brows */}
          {config.hairStyle === "bun" && (
            <>
              <mesh position={[0, 0.235, -0.03]} material={mats.hair}>
                <sphereGeometry args={[0.253, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
              </mesh>
              <mesh position={[0, 0.44, -0.12]} material={mats.hair}>
                <sphereGeometry args={[0.09, 16, 12]} />
              </mesh>
            </>
          )}
          {config.hairStyle === "cap" && (
            <mesh position={[0, 0.235, -0.03]} material={mats.hair}>
              <sphereGeometry args={[0.253, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            </mesh>
          )}
          {config.hairStyle === "buzz" && (
            <mesh position={[0, 0.235, -0.02]} material={mats.hair}>
              <sphereGeometry args={[0.249, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.34]} />
            </mesh>
          )}
          {config.hairStyle === "surgical" && (
            <mesh position={[0, 0.24, -0.02]} material={mats.cap}>
              <sphereGeometry args={[0.257, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
            </mesh>
          )}

          {/* eyes */}
          <group ref={eyeLRef} position={[-0.088, 0.2, 0.19]}>
            <mesh material={mats.eyeWhite}>
              <sphereGeometry args={[0.047, 16, 12]} />
            </mesh>
            <mesh ref={pupilLRef} position={[0, 0, 0.036]} material={mats.pupil}>
              <sphereGeometry args={[0.021, 12, 10]} />
            </mesh>
          </group>
          <group ref={eyeRRef} position={[0.088, 0.2, 0.19]}>
            <mesh material={mats.eyeWhite}>
              <sphereGeometry args={[0.047, 16, 12]} />
            </mesh>
            <mesh ref={pupilRRef} position={[0, 0, 0.036]} material={mats.pupil}>
              <sphereGeometry args={[0.021, 12, 10]} />
            </mesh>
          </group>

          {/* brows */}
          <mesh ref={browLRef} position={[-0.088, 0.275, 0.21]} rotation={[0, 0, 0.12]} material={mats.hair}>
            <boxGeometry args={[0.075, 0.016, 0.02]} />
          </mesh>
          <mesh ref={browRRef} position={[0.088, 0.275, 0.21]} rotation={[0, 0, -0.12]} material={mats.hair}>
            <boxGeometry args={[0.075, 0.016, 0.02]} />
          </mesh>

          {/* nose */}
          <mesh position={[0, 0.13, 0.225]} material={mats.skinShadow}>
            <sphereGeometry args={[0.032, 12, 10]} />
          </mesh>

          {/* smile — a half torus arc */}
          <mesh ref={mouthRef} position={[0, 0.07, 0.21]} rotation={[-0.18, 0, Math.PI]} material={mats.mouth}>
            <torusGeometry args={[0.045, 0.009, 10, 24, Math.PI]} />
          </mesh>

          {/* surgical mask pulled down under the chin */}
          {config.hasMask && (
            <mesh position={[0, -0.015, 0.19]} rotation={[0.45, 0, 0]} material={mats.mask}>
              <boxGeometry args={[0.16, 0.08, 0.045]} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

/* ----------------------------------- Scene ----------------------------------- */

const Crew: React.FC<{ mouseRef: MouseRef; focusRef: React.MutableRefObject<AuthFieldFocus> }> = ({
  mouseRef,
  focusRef,
}) => {
  const doctors: DoctorConfig[] = useMemo(
    () => [
      {
        // Senior consultant — white coat, stethoscope, grey hair
        skin: "#c98d5e",
        skinShadow: "#b57a4e",
        hair: "#d9d4cd",
        hairStyle: "cap",
        scrub: "#3e7d6b",
        scrubDark: "#336657",
        pants: "#3e7d6b",
        hasCoat: true,
        hasStethoscope: true,
        hasMask: false,
        scale: 1.04,
        position: [-1.18, 0, -0.12],
        baseYaw: 0.14,
        phase: 0,
        turnAwayDir: -1,
      },
      {
        // Resident — teal scrubs, blonde bun
        skin: "#f5cfA6",
        skinShadow: "#e8bb8f",
        hair: "#e3b96a",
        hairStyle: "bun",
        scrub: "#3aa79c",
        scrubDark: "#2f8a81",
        pants: "#3aa79c",
        hasCoat: false,
        hasStethoscope: false,
        hasMask: false,
        scale: 0.96,
        position: [0, 0, 0.16],
        baseYaw: 0,
        phase: 1.7,
        turnAwayDir: 1,
      },
      {
        // Surgeon — blue scrubs, cap and mask pulled down
        skin: "#7c4a2d",
        skinShadow: "#6b3e24",
        hair: "#22180f",
        hairStyle: "surgical",
        scrub: "#5b87c7",
        scrubDark: "#4a71ab",
        pants: "#4a71ab",
        hasCoat: false,
        hasStethoscope: false,
        hasMask: true,
        scale: 1.0,
        position: [1.18, 0, -0.06],
        baseYaw: -0.14,
        phase: 3.3,
        turnAwayDir: 1,
      },
    ],
    []
  );

  return (
    <>
      {doctors.map((d, i) => (
        <Doctor key={i} config={d} mouseRef={mouseRef} focusRef={focusRef} />
      ))}
    </>
  );
};

/* Pins the camera every frame so nothing else can re-aim it */
const CameraRig: React.FC = () => {
  useFrame((state) => {
    state.camera.position.set(0, 1.0, 5.6);
    state.camera.lookAt(0, 1.0, 0);
  });
  return null;
};

export const DoctorsScene: React.FC<DoctorsSceneProps> = ({ focusedField, isDarkMode }) => {
  const mouseRef = useRef({ x: 0, y: 0 });
  const focusRef = useRef<AuthFieldFocus>(focusedField);

  useEffect(() => {
    focusRef.current = focusedField;
  }, [focusedField]);

  // Track the cursor across the whole page (not just above the canvas)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="w-full h-full" id="doctors-3d-scene">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.95, 5.6], fov: 36 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <CameraRig />
        <ambientLight intensity={isDarkMode ? 0.85 : 1.0} />
        <directionalLight position={[3.5, 5.5, 4]} intensity={isDarkMode ? 1.4 : 1.6} />
        <directionalLight position={[-4, 2.5, 2]} intensity={isDarkMode ? 0.45 : 0.5} color={isDarkMode ? "#9db8ff" : "#cfe4ff"} />
        <pointLight position={[0, 0.6, 3.2]} intensity={isDarkMode ? 0.5 : 0.35} color={isDarkMode ? "#7D8C61" : "#99E1D9"} />

        <Crew mouseRef={mouseRef} focusRef={focusRef} />

        {/* soft blob shadows under each doctor */}
        {[[-1.18, -0.12], [0, 0.16], [1.18, -0.06]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.52, 28]} />
            <meshBasicMaterial color={isDarkMode ? "#000000" : "#2c4636"} transparent opacity={isDarkMode ? 0.4 : 0.18} />
          </mesh>
        ))}
      </Canvas>
    </div>
  );
};

export default DoctorsScene;
