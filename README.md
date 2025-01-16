# Tiny - a tiny game engine

## Game mechanics to try

- [ ] Dice throwing (result based on manual input + random and physics simulation, later will be transferred to the server???);
- [ ] u64 input with a pad (8x8 grid of cells, toggling from 1 to 0 on touch. The skill selector at mobile);

## Roadmap

### Basics

- [ ] Setup basic 3d WebGPU render within `tiny/core`;
- [ ] Render a [basic scene](https://webgpu.github.io/webgpu-samples/?sample=normalMap#mesh.ts) (camera, cube, lightning);
- [ ] MSAA;
- [ ] Canvas resize, animation (orbital camera movement);
- [ ] Add `clang` [c to wasm pipeline](https://surma.dev/things/c-to-webassembly/);
- [ ] Turn rendering functions to FFI (a subset of high level function, as FFI is expensive);
- [ ] Turn user input into FFI function (update game state in wasm in response to JS input);
- [ ] `SharedArrayBuffers`???
- [ ] Debugger inside WASM???

### Advanced

- [ ] Instancing (use game objects with transforms);
- [ ] Sharing buffers between WASM and GPU???
- [ ] Using WebGPU for computations (basic movement, physics???);
- [ ] Returning data from GPU (object the mouse pointing to);
- [ ] Normal maps;
- [ ] Shadows;
- [ ] Simple FX (outlines)???;
- [ ] Simple shading (toon shader)???;
- [ ] PostFX (pixelation)???;
- [ ] GLTF import;
- [ ] Skeletal animation;

### ECS

- [ ] C lib for ECS that works both for WASM and multithreaded BE app;
- [ ] Use C as a language for the server or figure out node workers + WASM?;

