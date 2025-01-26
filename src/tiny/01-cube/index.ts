import { mat4, vec3 } from 'wgpu-matrix'
import {
  cubeColorOffset,
  cubePositionOffset,
  cubeVertexArray,
  cubeVertexCount,
  cubeVertexSize,
} from './cube'
import shader from './shader.wgsl?raw'

export async function init({ canvas }: { canvas: HTMLCanvasElement }) {
  const ctx: GPUCanvasContext | null = canvas.getContext('webgpu')
  if (!ctx) throw new Error('Webgpu context is unavailable')

  const adapter = await navigator.gpu?.requestAdapter()
  if (!adapter) throw new Error('GPU adapter is unavailable')

  const device = await adapter.requestDevice()
  if (!device) throw new Error('GPU device is unavailable')

  const format = navigator.gpu.getPreferredCanvasFormat()
  ctx.configure({ device, format })

  const vertBuffer = device.createBuffer({
    size: cubeVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  })

  new Float32Array(vertBuffer.getMappedRange()).set(cubeVertexArray)
  vertBuffer.unmap()

  const shaderModule = device.createShaderModule({
    label: 'rotating_cube_shader',
    code: shader,
  })

  const pipeline = device.createRenderPipeline({
    label: 'roating_cube_pipeline',
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'v_main',
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
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'f_main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list', cullMode: 'back' },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
    multisample: {
      count: 4,
    },
  })

  const bufUniforms = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: { buffer: bufUniforms },
      },
    ],
  })

  let txMSSA: GPUTexture
  let txDepth: GPUTexture
  const onResize = () => {
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio

    txMSSA = device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: 4,
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })

    txDepth = device.createTexture({
      size: [canvas.width, canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      sampleCount: 4,
    })
  }

  window.addEventListener('resize', onResize)
  onResize()

  const draw = (_dt: number) => {
    const textureView = txMSSA.createView()
    const txScreen = ctx.getCurrentTexture().createView()

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          resolveTarget: txScreen,
          clearValue: [0, 0, 0, 1.0],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: txDepth.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    }

    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)

    const aspect = canvas.width / canvas.height
    const projectionMat = mat4.perspective((2 * Math.PI) / 5, aspect, 1, 100.0)
    const modelViewMat = mat4.create()
    const viewMat = mat4.identity()
    mat4.translate(viewMat, vec3.fromValues(0, 0, -4), viewMat)
    mat4.rotate(
      viewMat,
      vec3.fromValues(Math.sin(Math.PI / 3), Math.cos(Math.PI / 6), 0),
      1,
      viewMat,
    )
    mat4.mul(projectionMat, viewMat, modelViewMat)

    device.queue.writeBuffer(
      bufUniforms,
      0,
      modelViewMat.buffer,
      modelViewMat.byteOffset,
      modelViewMat.byteLength,
    )

    passEncoder.setPipeline(pipeline)
    passEncoder.setBindGroup(0, uniformBindGroup)
    passEncoder.setVertexBuffer(0, vertBuffer)
    passEncoder.draw(cubeVertexCount)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
  }

  return { draw }
}
