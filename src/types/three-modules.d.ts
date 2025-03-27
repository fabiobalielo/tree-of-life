declare module "three/examples/jsm/controls/OrbitControls.js" {
  import { Camera, Object3D } from "three";
  export class OrbitControls {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: Object3D;
    update(): void;
    addEventListener(event: string, callback: Function): void;
    removeEventListener(event: string, callback: Function): void;
    reset(): void;
    dispose(): void;
    dampingFactor: number;
    enableDamping: boolean;
    screenSpacePanning: boolean;
  }
}
