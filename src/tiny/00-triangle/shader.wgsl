struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@vertex
fn v_main(
  @location(0) position: vec3f,
  @location(1) color: vec3f,
) -> VertexOut {
  var out: VertexOut;
  out.position = vec4f(position, 1.0);
  out.color = vec4f(color, 1.0);
  return out;
}

@fragment
fn f_main(fragData: VertexOut) -> @location(0) vec4f {
  return fragData.color;
}
