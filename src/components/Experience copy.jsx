import {
  Float,
  OrbitControls,
  PerspectiveCamera,
  shaderMaterial,
  Text,
  useScroll,
} from "@react-three/drei";
import Background from "./Background";
import { Airplane } from "./Airplane";
import { Cloud } from "./Cloud";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";

const LINE_NB_POINTS = 12000;

// Custom Rainbow Material, for text's Rainbow color
const RainbowTextMaterial = shaderMaterial(
  { time: 0 },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time;
    varying vec2 vUv;
    void main() {
      vec3 color = 0.4 + 0.3 * cos(6.2831 * (vUv.x + time + vec3(0.0, 0.33, 0.66)));
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ RainbowTextMaterial });

export const Experience = () => {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -10),
        new THREE.Vector3(-2, 0, -20),
        new THREE.Vector3(-3, 0, -30),
        new THREE.Vector3(0, 0, -40),
        new THREE.Vector3(5, 0, -50),
        new THREE.Vector3(7, 0, -60),
        new THREE.Vector3(5, 0, -70),
        new THREE.Vector3(0, 0, -80),
        new THREE.Vector3(0, 0, -90),
        new THREE.Vector3(0, 0, -100),
      ],
      false,
      "catmullrom",
      0.5
    );
  }, []);

  const linePoints = useMemo(() => {
    return curve.getPoints(LINE_NB_POINTS);
  }, [curve]);

  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.2);
    shape.lineTo(0, 0.2);
    return shape;
  }, []);

  const cameraGroup = useRef();
  const cameraRef = useRef();
  const airplane = useRef();
  const rainbowMaterialRef = useRef(); // Use ref for RainbowTextMaterial
  const scroll = useScroll();

  useFrame((_state, delta) => {
    if (rainbowMaterialRef.current) {
      rainbowMaterialRef.current.time += delta;
    }

    const curPointIndex = Math.min(
      Math.round(scroll.offset * linePoints.length),
      linePoints.length - 1
    );

    const curPoint = linePoints[curPointIndex];
    const nextPoint =
      linePoints[Math.min(curPointIndex + 1, linePoints.length - 1)];

    const xDisplacement = (nextPoint.x - curPoint.x) * 80;
    const angleRotation =
      (xDisplacement < 0 ? 1 : -1) *
      Math.min(Math.abs(xDisplacement), Math.PI / 3);

    const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        airplane.current.rotation.x,
        airplane.current.rotation.y,
        angleRotation
      )
    );

    airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2);

    cameraGroup.current.position.lerp(curPoint, delta * 20);
    cameraRef.current.lookAt(nextPoint);
  });

  return (
    <>
      <group ref={cameraGroup}>
        <Background />
        <PerspectiveCamera
          ref={cameraRef}
          position={[0, 0, 5]}
          fov={30}
          makeDefault
        />
        <group ref={airplane}>
          <Float floatIntensity={1} speed={1.5} rotationIntensity={0.5}>
            <Airplane
              rotation-y={Math.PI / 2}
              scale={[0.2, 0.2, 0.2]}
              position={0.1}
            />
          </Float>
        </group>
      </group>

      {/* Text Content */}
      <group position={[1, 0, -10]}>
        <Float floatIntensity={5} speed={5}>
          <Text
            anchorX="left"
            anchorY="center"
            fontSize={0.22}
            fontWeight={500}
            maxWidth={2.5}
          >
            <rainbowTextMaterial ref={rainbowMaterialRef} attach="material" />
            Welcome to Udankhatola...
          </Text>

          <Text
            color="white"
            anchorX="left"
            anchorY="top"
            position-y={-0.66}
            fontSize={0.18}
            fontWeight={300}
            maxWidth={2.5}
          >
            Have a seat and enjoy the ride!
          </Text>
        </Float>
      </group>

      <group position={[-5, 0, -30]}>
        <Float floatIntensity={5} speed={3}>
          <Text
            color="white"
            anchorX="left"
            anchorY="middle"
            fontSize={0.18}
            maxWidth={2.5}
          >
            Ek modddd ayaaa...
            {"\n"}
            Me uthhe passenger chhod ayaaa 😁
          </Text>
        </Float>
      </group>

      <group position={[7, 0, -70]}>
        <Float floatIntensity={5} speed={3}>
          <Text
            color="white"
            anchorX="left"
            anchorY="middle"
            fontSize={0.18}
            maxWidth={2.5}
          >
            👈 iss taraf jaa bhai...
          </Text>
        </Float>
      </group>

      <group position={[0, 0, -100]}>
        <Float floatIntensity={5} speed={10}>
          <Text
            color="#701b1b"
            anchorX="left"
            anchorY="middle"
            fontSize={0.18}
            maxWidth={2.5}
          >
            Bass kar bhai,
            {"\n"}
            Aage kuch nai hai...🤚
          </Text>
        </Float>
      </group>

      {/* Line Path */}
      <group position-y={-2}>
        <mesh>
          <extrudeGeometry
            args={[
              shape,
              {
                steps: LINE_NB_POINTS,
                bevelEnabled: false,
                extrudePath: curve,
              },
            ]}
          />
          <meshStandardMaterial color={"white"} opacity={0.7} transparent />
        </mesh>
      </group>

      {/* Clouds */}
      <Cloud opacity={0.5} scale={[0.3, 0.3, 0.3]} position={[-2, 1, -3]} />
      <Cloud
        opacity={0.5}
        scale={[0.2, 0.3, 0.4]}
        position={[1.5, -0.5, -1.2]}
      />
      <Cloud
        opacity={0.7}
        scale={[0.3, 0.3, 0.4]}
        position={[2, -0.2, -2]}
        rotation-y={Math.PI / 9}
      />
      <Cloud
        opacity={0.7}
        scale={[0.4, 0.4, 0.4]}
        position={[1, -0.2, -12]}
        rotation-y={Math.PI / 9}
      />
      <Cloud opacity={0.7} scale={[0.5, 0.5, 0.5]} position={[-1, 1, -53]} />
      <Cloud opacity={0.3} scale={[0.8, 0.8, 0.8]} position={[0, 1, -60]} />
    </>
  );
};
