import React, { useState, useEffect, useRef } from 'react';
import { Media } from './types';

export default ({
  srcMedia,
  dstMedia,
}: {
  srcMedia: Media;
  dstMedia: Media;
}) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);

    const ctx = (canvasRef.current as HTMLCanvasElement).getContext('2d');
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, width, height);
  }, [srcMedia, dstMedia]);

  return <canvas width={width} height={height} ref={canvasRef} />;
};
