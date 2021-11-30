import React, { useEffect, useRef } from 'react';
import { Input } from './types';
import state from './state';
import { canvas, program, gl, setTextureImage } from './graphics';

export default ({ srcInput, dstInput }: { srcInput: Input; dstInput: Input; }) => {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    root.current.append(canvas);
  }, []);
  useEffect(() => {
    state.src.source = srcInput.source;
    if (state.src.source instanceof HTMLImageElement) {
      setTextureImage(gl, 0, state.src.source);
      gl.uniform2f(gl.getUniformLocation(program, 'src_size'), state.src.source.width, state.src.source.height);
    }
    if (state.src.source instanceof HTMLVideoElement) {
      gl.uniform2f(gl.getUniformLocation(program, 'src_size'), state.src.source.videoWidth, state.src.source.videoHeight);
    }
  }, [srcInput.source]);
  useEffect(() => {
    state.dst.source = dstInput.source;
    if (state.dst.source instanceof HTMLImageElement) {
      setTextureImage(gl, 1, state.dst.source);
      gl.uniform2f(gl.getUniformLocation(program, 'dst_size'), state.dst.source.width, state.dst.source.height);
    }
    if (state.dst.source instanceof HTMLVideoElement) {
      gl.uniform2f(gl.getUniformLocation(program, 'dst_size'), state.dst.source.videoWidth, state.dst.source.videoHeight);
    }
  }, [dstInput.source]);
  useEffect(() => {
    state.src.cover = srcInput.cover;
    gl.uniform1i(gl.getUniformLocation(program, 'src_cover'), state.src.cover ? 1 : 0);
  }, [srcInput.cover]);
  useEffect(() => {
    state.dst.cover = dstInput.cover;
    gl.uniform1i(gl.getUniformLocation(program, 'dst_cover'), state.dst.cover ? 1 : 0);
  }, [dstInput.cover]);
  return <div ref={root} />;
};
