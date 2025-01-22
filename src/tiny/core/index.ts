// import { makePipeline } from "./trianglePipeline"
import { mat4, vec3 } from "wgpu-matrix"
import { makePipeline } from "./cubePipeline"

export async function init(canvas: HTMLCanvasElement) {
  // TODO: add default fallback to WebGL
  const ctx: GPUCanvasContext | null = canvas.getContext('webgpu')
  if (!ctx) throw new Error('Webgpu context is unavailable')

  const adapter = await navigator.gpu?.requestAdapter()
  if (!adapter) throw new Error('GPU adapter is unavailable')

  const device = await adapter.requestDevice()
  if (!device) throw new Error('GPU device is unavailable')

  const format = navigator.gpu.getPreferredCanvasFormat()
  const devicePixelRatio = window.devicePixelRatio

  if (canvas instanceof OffscreenCanvas) {
    throw new Error('HTMLCanvasElement is required')
  }


  ctx.configure({ device, format })





  // TODO: Figure out how to compose pipelines properly
  // Color triangle
  // const pipeline = makePipeline(device) 

  // Color cube
  const renderCube = makePipeline(device)
  let depthTexture: GPUTexture

  // Post processing into texture
  let texture: GPUTexture
  const onResize = () => {
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio

    texture = device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: 4,
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    
    depthTexture = device.createTexture({
      size: [canvas.width, canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
  }

  // Assuming the canvas is set sized by CSS
  window.addEventListener('resize', onResize)
  onResize()

  return (_dt: number) => {
    const textureView = texture.createView()
    const screenTexture = ctx.getCurrentTexture().createView()

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          // view: textureView,
          // resolveTarget: screenTexture,
          view: screenTexture,
          clearValue: [0, 0, 0, 1.0],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    }

    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    // Color triangle
    // passEncoder.setPipeline(pipeline)
    // passEncoder.draw(3)

    // Color cube
    const aspect = canvas.width / canvas.height
    const projectionMat = mat4.perspective((2 * Math.PI) / 5, aspect, 1, 100.0)
    const modelViewMat = mat4.create()
    const viewMat = mat4.identity()
    mat4.translate(viewMat, vec3.fromValues(0, 0, -4), viewMat)
        mat4.rotate(viewMat, vec3.fromValues(Math.sin(Math.PI / 3), Math.cos(Math.PI / 6), 0), 1, viewMat)
    mat4.mul(projectionMat, viewMat, modelViewMat)
    renderCube(passEncoder, modelViewMat)

    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
  }
}
