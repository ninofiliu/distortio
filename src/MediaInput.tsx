import React, { useState, useRef, Dispatch, SetStateAction } from 'react';
import { Input } from './types';

type Media =
  | { kind: 'image'; href: string; }
  | { kind: 'stream'; }

export default ({ input, setInput }: { input: Input; setInput: Dispatch<SetStateAction<Input>>; }) => {
  const streamVideo = useRef<HTMLVideoElement>(null);
  const [media, setMedia] = useState<Media>(null);
  const [fileName, setFileName] = useState<string>('');

  const onUpload = (evt: any) => {
    const file = evt.target.files[0] as File;
    setFileName(file.name);
    const href = URL.createObjectURL(file);
    setMedia({ kind: 'image', href });
    const img = document.createElement('img');
    img.src = href;
    img.onload = () => {
      setInput({ ...input, source: img });
    };
  };

  const capture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setMedia({ kind: 'stream' });
    streamVideo.current.srcObject = stream;
    streamVideo.current.oncanplay = () => {
      setInput({ ...input, source: streamVideo.current });
    };
  };

  return (
    <>
      {media === null && <div>Chose one</div>}
      {media?.kind === 'image' && <img className="preview" src={media.href} />}
      {media?.kind === 'stream' && <video className="preview" ref={streamVideo} muted autoPlay loop />}

      <div>
        Image upload:&nbsp;
        <label className="input-label">
          {(fileName && media?.kind === 'image')
            ? <>{fileName} [Chose another]</>
            : <>[Browse]</>}
          <input
            type="file"
            accept="image/*"
            onInput={onUpload}
          />
        </label>
      </div>
      <div>Webcam: <button onClick={capture} type="button">Capture</button></div>
      <div>
        <button
          type="button"
          onClick={() => setInput({ ...input, cover: true })}
          disabled={input.cover}
        >
          Cover
        </button>&nbsp;
        <button
          type="button"
          onClick={() => setInput({ ...input, cover: false })}
          disabled={!input.cover}
        >
          Fill
        </button>
      </div>
    </>
  );
};
