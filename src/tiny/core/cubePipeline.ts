import { cubeColorOffset, cubePositionOffset, cubeVertexArray, cubeVertexCount, cubeVertexSize } from "./cube";
import cubeVertWGSL from './cubeVert.wgsl?raw'
import cubeFragWGSL from './cubeFrag.wgsl?raw'
import { Mat4, Mat4Type } from "wgpu-matrix";

export function makePipeline(
  device: GPUDevice,
) {
  const vertBuffer = device.createBuffer({
    size: cubeVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  })

  new Float32Array(vertBuffer.getMappedRange()).set(cubeVertexArray)
  vertBuffer.unmap()

  const pipeline = device.createRenderPipeline({
    label: 'rotating_color_cube',
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: cubeVertWGSL,
      }),
      buffers: [
        {
          arrayStride: cubeVertexSize,
          attributes: [
            {
              shaderLocation: 0,
              offset: cubePositionOffset,
              format: 'float32x4',
            },
            {
              shaderLocation: 1,
              offset: cubeColorOffset,
              format: 'float32x4',
            }
          ],
        }
      ],
    },
    fragment: {
      module: device.createShaderModule({ code: cubeFragWGSL }),
      targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
    },
    primitive: { topology: 'triangle-list', cullMode: 'back' },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  })

  const uniformBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: { buffer: uniformBuffer },
      },
    ],
  })
  
  return (
    passEncoder: GPURenderPassEncoder,
    projectionMatrix: Mat4,
  ) => {
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      projectionMatrix.buffer,
      projectionMatrix.byteOffset,
      projectionMatrix.byteLength,
    )

    passEncoder.setPipeline(pipeline)
    passEncoder.setBindGroup(0, uniformBindGroup)
    passEncoder.setVertexBuffer(0, vertBuffer)
      passEncoder.draw(cubeVertexCount)
  }
}
