import triangleVertWGSL from './triangleVert.wgsl?raw'
import triangleFragWGSL from './triangleFrag.wgsl?raw'

export function makePipeline(device: GPUDevice) {
  return device.createRenderPipeline({
    label: 'color_triangle',
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
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
    multisample: {
      count: 4,
    },
  })
}
