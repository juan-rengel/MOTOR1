/**
 * Gera um modelo 3D demonstrativo (cadeira de design) em GLB, usado para
 * validar a cena "Modelo próprio" sem depender de arquivos de terceiros.
 *
 * Uso: npm run assets:model   →  public/assets/demo/models/chair.glb
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// O exportador usa FileReader (API de navegador); implementação mínima para Node.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.({ target: this });
      this.onload?.({ target: this });
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString("base64")}`;
      this.onloadend?.({ target: this });
      this.onload?.({ target: this });
    });
  }
};

const wood = new THREE.MeshStandardMaterial({ name: "Madeira", color: 0x9a6438, roughness: 0.55 });
const fabric = new THREE.MeshStandardMaterial({ name: "Tecido", color: 0x2f5d62, roughness: 0.85 });
const chair = new THREE.Group();
chair.name = "Cadeira";

const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.85, 4, 1, 4), fabric);
seat.position.set(0, 0.92, 0);
chair.add(seat);
const back = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.7, 0.1, 4, 4, 1), fabric);
back.position.set(0, 1.45, -0.4);
back.rotation.x = -0.12;
chair.add(back);
const frame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.9), wood);
frame.position.set(0, 0.84, 0);
chair.add(frame);
for (const [x, z] of [[0.4, 0.38], [-0.4, 0.38], [0.4, -0.38], [-0.4, -0.38]]) {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.022, 0.86, 16), wood);
  leg.position.set(x, 0.43, z);
  leg.rotation.z = x > 0 ? -0.06 : 0.06;
  leg.rotation.x = z > 0 ? 0.06 : -0.06;
  chair.add(leg);
}
for (const x of [0.4, -0.4]) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 12), wood);
  post.position.set(x, 1.28, -0.42);
  post.rotation.x = -0.12;
  chair.add(post);
}

const scene = new THREE.Scene();
scene.add(chair);
const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(scene, { binary: true });
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public/assets/demo/models/chair.glb");
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, Buffer.from(glb));
console.log(`✓ ${path.relative(process.cwd(), out)} (${Buffer.from(glb).byteLength} bytes)`);
