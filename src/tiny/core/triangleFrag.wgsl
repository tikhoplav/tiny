struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@fragment
fn main(fragData: VertexOut) -> @location(0) vec4f {
  return fragData.color;
}
