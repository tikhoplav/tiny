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

  const shaderModule = device.createShaderModule({
    label: 'color_triangle_shader',
    code: shader,
  })

  const bufLayoutDescVertex: GPUVertexBufferLayout = {
    attributes: [
      {
        shaderLocation: 0,
        offset: 0,
        format: 'float32x3',
      },
      {
        shaderLocation: 1,
        offset: 12,
        format: 'float32x3',
      },
    ],
    arrayStride: 24,
    stepMode: 'vertex',
  }

  const pipeline = device.createRenderPipeline({
    label: 'color_triangle',
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'v_main',
      buffers: [bufLayoutDescVertex],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'f_main',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
      frontFace: 'cw',
      cullMode: 'back',
    },
    multisample: {
      count: 4,
    },
  })



  // prettier-ignore
  const vertexData = new Float32Array([
    0.0, 0.5, 0.0,
    1.0, 0.0, 0.0,

    0.43301, -0.25, 0.0,
    0.0, 1.0, 0.0,

    -0.43301, -0.25, 0.0,
    0.0, 0.0, 1.0,
  ])

  const bufVertex = device.createBuffer({
    size: vertexData.length * 4,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  })
  new Float32Array(bufVertex.getMappedRange())
    .set(vertexData)
  bufVertex.unmap()



  const { devicePixelRatio } = window
  let txMSAA: GPUTexture
  const onResize = () => {
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio

    txMSAA = device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: 4,
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
  }

  window.addEventListener('resize', onResize)
  onResize()

  /**
   * A function to be called at each animation frame, updates internal
   * render state and dispatches a draw call to the GPU.
   */
  const draw = (_dt: number) => {
    const textureView = txMSAA.createView()
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
    }

    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)

    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, bufVertex)
    passEncoder.draw(3)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
  }

  return { draw }
}
