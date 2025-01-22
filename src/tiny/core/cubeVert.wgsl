struct Uniforms {
  projectionMatrix: mat4x4f,
}
@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@vertex
fn main(
  @location(0) position: vec4f,
  @location(1) color: vec4f,
) -> VertexOut {
  var out: VertexOut;

  out.position = uniforms.projectionMatrix * position;
  out.color = color;

  return out;
}
