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

const LINE_NB_POINTS = 2000;
const CURVE_DISTANCE = 250;
const CURVE_AHEAD_CAMERA = 0.008;
const CURVE_AHEAD_ARIPLANE = 0.02;
const AIRPLANE_MAX_ANGLE = 35;

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
        new THREE.Vector3(0, 0, -CURVE_DISTANCE),
        new THREE.Vector3(100, 0, -2 * CURVE_DISTANCE),
        new THREE.Vector3(-100, 0, -3 * CURVE_DISTANCE),
        new THREE.Vector3(100, 0, -4 * CURVE_DISTANCE),
        new THREE.Vector3(5, 0, -5 * CURVE_DISTANCE),
        new THREE.Vector3(7, 0, -6 * CURVE_DISTANCE),
        new THREE.Vector3(5, 0, -7 * CURVE_DISTANCE),
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
    const scrollOffset = Math.max(0, scroll.offset);

    const curPoint = curve.getPoint(scrollOffset);

    //follow the curve points
    cameraGroup.current.position.lerp(curPoint, delta * 24);

    const lookAtPoint = curve.getPoint(
      Math.min(scrollOffset + CURVE_AHEAD_CAMERA, 1)
    );

    const currectLookAt = cameraGroup.current.getWorldDirection(
      new THREE.Vector3()
    );
    const targetLookAt = new THREE.Vector3()
      .subVectors(curPoint, lookAtPoint)
      .normalize();

    const lookAt = currectLookAt.lerp(targetLookAt, delta * 24);
    cameraGroup.current.lookAt(
      cameraGroup.current.position.clone().add(lookAt)
    );

    //Airplane rotation
    const tangent = curve.getTangent(scrollOffset + CURVE_AHEAD_ARIPLANE);

    const nonLerpLookAt = new THREE.Group();
    nonLerpLookAt.position.copy(curPoint);
    nonLerpLookAt.lookAt(nonLerpLookAt.position.clone().add(targetLookAt));

    tangent.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -nonLerpLookAt.rotation.y
    );

    let angle = Math.atan2(-tangent.z, tangent.x);
    angle = -Math.PI / 2 + angle;

    let angleDegrees = (angle * 180) / Math.PI;
    angleDegrees *= 2.4;

    //limit plane angle
    if (angleDegrees < 0) {
      angleDegrees = Math.max(angleDegrees, -AIRPLANE_MAX_ANGLE);
    }
    if (angleDegrees > 0) {
      angleDegrees = Math.min(angleDegrees, AIRPLANE_MAX_ANGLE);
    }

    //set back angle
    angle = (angleDegrees * Math.PI) / 180;

    const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        airplane.current.rotation.x,
        airplane.current.rotation.y,
        angle
      )
    );
    airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2);
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
        <Float floatIntensity={10} speed={5}>
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
            color="black"
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

      <group position={[5, 0, -7 * CURVE_DISTANCE]}>
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
      <Cloud scale={[1, 1, 1.5]} position={[-3.5, -1.2, -7]} />
      <Cloud
        opacity={0.5}
        scale={[1, 1, 2]}
        position={[3.5, -1, -10]}
        rotation-y={Math.PI}
      />
      <Cloud
        scale={[1, 1, 1]}
        position={[-3.5, 0.2, -12]}
        rotation-y={Math.PI / 3}
      />
      <Cloud scale={[1, 1, 1]} position={[3.5, 0.2, -12]} />
      <Cloud
        scale={[0.4, 0.4, 0.4]}
        rotation-y={Math.PI / 9}
        position={[1, -0.2, -12]}
      />
      <Cloud scale={[0.3, 0.5, 2]} position={[-4, -0.5, -53]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-1, -1.5, -100]} />
    </>
  );
};
