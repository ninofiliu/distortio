#version 300 es
precision highp float;
uniform sampler2D u_src;
in vec2 v_position;
out vec4 color;
  
void main() {
  vec2 src_position = vec2(
    0.5+0.5*v_position.x,
    0.5-0.5*v_position.y
  );
  color = texture(u_src, src_position);
}
