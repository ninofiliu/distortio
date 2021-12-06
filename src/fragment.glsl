#version 300 es
precision highp float;
uniform vec2 size;
uniform sampler2D src_img;
uniform int src_cover;
uniform vec2 src_size;
uniform sampler2D dst_img;
uniform int dst_cover;
uniform vec2 dst_size;
uniform vec2 mouse;
uniform float force;
uniform float time;
in vec2 v_position;
out vec4 color;
  
void main() {
  vec2 dst_pointer = vec2(v_position.x, -v_position.y);
  float dst_ratio = (dst_size.x / dst_size.y) / (size.x / size.y);
  if (dst_cover == 1) {
    if (dst_ratio < 1.0) {
      dst_pointer.y *= dst_ratio;
    } else {
      dst_pointer.x /= dst_ratio;
    }
  }
  dst_pointer = 0.5 + 0.5 * dst_pointer;

  vec4 p = texture(dst_img, dst_pointer);
  vec2 offset = vec2(p.r - mouse.x, p.b + mouse.y);

  vec2 src_pointer = vec2(v_position.x, -v_position.y);
  float src_ratio = (src_size.x / src_size.y) / (size.x / size.y);
  if (src_cover == 1) {
    if (src_ratio < 1.0) {
      src_pointer.y *= src_ratio;
    } else {
      src_pointer.x /= src_ratio;
    }
  }
  src_pointer = 0.5 + 0.5 * src_pointer;
  float e_force = -log2(1.0-force);
  src_pointer = mod(src_pointer + e_force * offset, 1.0);

  color = texture(src_img, src_pointer);
}
