import triangleVertWGSL from './triangleVert.wgsl?raw'
import triangleFragWGSL from './triangleFrag.wgsl?raw'

export async function init(ctx: GPUCanvasContext) {
  // TODO: add default fallback to WebGL
  const adapter = await navigator.gpu?.requestAdapter()
  if (!adapter) throw new Error('GPU adapter is unavailable')

  const device = await adapter.requestDevice()
  if (!device) throw new Error('GPU device is unavailable')

  const format = navigator.gpu.getPreferredCanvasFormat()
  const devicePixelRatio = window.devicePixelRatio

  const canvas = ctx.canvas
  if (canvas instanceof OffscreenCanvas) {
    throw new Error('HTMLCanvasElement is required')
  }

  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio

  ctx.configure({ device, format })

  // --- Rendering pipelines

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: triangleVertWGSL,
      }),
    },
    fragment: {
      module: device.createShaderModule({
        code: triangleFragWGSL,
      }),
      targets: [
        { format },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  })

  return (_dt: number) => {
    const textureView = ctx.getCurrentTexture().createView()

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: [0, 0, 0, 0],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }

    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipeline)
    passEncoder.draw(3)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
  }
}
