import React from 'react';

const PropsBlock = () => {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">Props</h2>
      <p className="mt-2">
        The <code className="bg-gray-100 p-1">AudioPlayer</code> component accepts the following props:
      </p>
      <ul className="list-disc list-inside mt-2">
        <li className="mt-2">
          <code className="bg-gray-100 p-1">className</code> (string, optional): A CSS class name for styling the component.
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">src</code> (string, required): The URL or file path of the audio file to be played.
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">preload</code> (string, optional): Specifies the preload behavior for the audio file. Possible values are.
          <ul className="list-disc list-inside mt-2">
            <li className="ml-4 mt-1">
              <code className="bg-gray-100 p-1">auto</code> The audio data is loaded as soon as possible.
            </li>
            <li className="ml-4 mt-1">
              <code className="bg-gray-100 p-1">metadata</code> Only metadata (e.g., duration) is loaded.
            </li>
            <li className="ml-4 mt-1">
              <code className="bg-gray-100 p-1">none</code> No preloading. Audio data is only loaded when requested.
            </li>
          </ul>
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">loop</code> (boolean, optional): Set to <code className="bg-gray-100 p-1">true</code> to loop the audio playback (default:{' '}
          <code className="bg-gray-100 p-1">false</code>).
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">volume</code> (number, optional): The initial volume level (0 to 100) of the audio (default: <code className="bg-gray-100 p-1">100</code>).
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">onPlay</code> (function, optional): Callback function to execute when the audio starts playing.
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">onPause</code> (function, optional): Callback function to execute when the audio is paused.
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">onEnd</code> (function, optional): Callback function to execute when the audio playback ends.
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">onError</code> (function, optional): Callback function to execute if there&quot;s an error loading or playing the audio.
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">backgroundColor</code> (string, optional): Set the background color of the audio player (default: <code className="bg-gray-100 p-1">#fff</code>).
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">color</code> (string, optional): The text and icon color of the audio player (default: <code className="bg-gray-100 p-1">#566574</code>).
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">sliderColor</code> (string, optional): The color of the progress slider (default: <code className="bg-gray-100 p-1">#007FFF</code>).
        </li>
        <li className="mt-2">
          <code className="bg-gray-100 p-1">volumePlacement</code> (string, optional): Control where the volume controls are located (<code className="bg-gray-100 p-1">top | bottom</code>) (default:{' '}
          <code className="bg-gray-100 p-1">bottom</code>).
        </li>
      </ul>
    </section>
  );
};

export default PropsBlock;
