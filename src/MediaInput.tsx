import React, { useRef, useEffect } from 'react';

import { Media } from './types';

export default ({
  media,
  onMedia,
}: {
  media: Media | null;
  onMedia: (m: Media) => any;
}) => {
  const streamVideo = useRef(null);
  const onUpload = (evt: any) => {
    const file = evt.target.files[0] as File;
    const kind = file.type.startsWith('image/') ? 'image' : 'video';
    const href = URL.createObjectURL(file);
    onMedia({ kind, href, file });
  };
  const capture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    onMedia({ kind: 'stream', stream });
  };
  useEffect(() => {
    if (!(media && 'stream' in media && media.stream)) return;
    streamVideo.current.srcObject = media.stream;
  });

  return (
    <>
      {media === null && <div>Chose one</div>}
      {media?.kind === 'image' && <img className="preview" src={media.href} />}
      {media?.kind === 'video' && <video className="preview" src={media.href} muted autoPlay loop />}
      {media?.kind === 'stream' && <video className="preview" ref={streamVideo} muted autoPlay loop />}
      <div>
        image or video upload:&nbsp;
        <input
          type="file"
          accept="image/*,video/*"
          onInput={onUpload}
        />
      </div>
      <div>webcam: <button onClick={capture} type="button">capture</button></div>
    </>
  );
};
