import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AudioInterface, AudioPlayerRef } from './core.interface';
import { iconPaths } from '../helpers/icons/icons';
import { formatTime } from '../helpers/utils/formatTime';
import { getRangeBox } from '../helpers/utils/getRangeBox';
import getDeviceEventNames from '../helpers/utils/getDeviceEventNames';
import './audioPlay.css';

export const AudioPlayer = forwardRef<AudioPlayerRef | undefined, AudioInterface>(
  (
    {
      autoPlay = false,
      className = '',
      src,
      loop = false,
      preload = 'auto',
      backgroundColor,
      color,
      width,
      style,
      sliderColor,
      volume = 100,
      volumePlacement = 'top',
      hasKeyBindings = true,
      onPlay,
      onPause,
      onEnd,
      onError
    },
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const currentlyDragged = useRef<HTMLDivElement | null>(null);
    const rewindPin = useRef<HTMLDivElement | null>(null);
    const volumePin = useRef<HTMLDivElement | null>(null);
    const [canPlay, setCanPlay] = useState<boolean>(preload === 'none');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progressBarPercent, setProgressBarPercent] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<string>('0:00');
    const [totalTime, setTotalTime] = useState<string>('--:--');
    const [volumeOpen, setVolumeOpen] = useState<boolean>(false);
    const [volumeProgress, setVolumeProgress] = useState<number>(100);
    const [speakerIcon, setSpeakerIcon] = useState<string>(getVolumePath(volume));
    const [coefficient, setCoefficient] = useState<number>(0);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
      // filter out audio.elm operation
      setIsPlaying(false);
      setTotalTime('--:--');
      setCanPlay(false);
      setHasError(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    useEffect(() => {
      if (audioRef.current?.duration && audioRef.current.duration !== Infinity) {
        setTotalTime(formatTime(audioRef.current.duration));
      }
    }, [audioRef.current?.duration]);

    useEffect(() => {
      if (!isNaN(volume)) {
        const tempVol = volume > 100 ? 100 : volume < 0 ? 0 : volume;
        setVolumeProgress(tempVol);
        if (audioRef.current) {
          audioRef.current.volume = tempVol / 100;
        }
      }
    }, [volume]);

    useImperativeHandle(ref, () => ({
      play: () => {
        play();
      },
      pause: () => {
        pause();
      },
      stop: () => {
        stop();
      },
      focus: () => {
        focus();
      }
    }));

    const getTotalDuration = () => {
      if (!audioRef.current) {
        return 0;
      }
      return audioRef.current.duration !== Infinity ? audioRef.current.duration : audioRef.current.buffered.end(0);
    };

    const handleCanPlay = () => {
      setCanPlay(true);
    };

    const handleReload = () => {
      if (audioRef.current) {
        setIsPlaying(false);
        setTotalTime('--:--');
        setCanPlay(false);
        setHasError(false);
        audioRef.current.src = src;
        audioRef.current.load();
      }
    };

    const handleOnError = (event: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      setCanPlay(true);
      setHasError(true);
      if (onError) {
        const mediaError = (event.target as HTMLAudioElement).error;
        let errorMessage = 'An unknown error occurred.';

        if (mediaError?.code) {
          switch (mediaError?.code) {
            case mediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'The media playback was aborted.';
              break;
            case mediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'A network error caused the media to fail.';
              break;
            case mediaError.MEDIA_ERR_DECODE:
              errorMessage = 'The media playback was aborted due to a decoding error.';
              break;
            case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'The media source format is not supported.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
              break;
          }
        }

        onError(event, errorMessage);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (totalTime === '--:--') {
          handleReload();
        }
        if (onEnd) {
          onEnd();
        }
      }
    };

    const handleUpdateVolume = () => {
      if (audioRef.current) {
        setVolumeProgress(audioRef.current.volume * 100);
        if (audioRef.current.volume >= 0.5) {
          setSpeakerIcon(iconPaths.fullVolume);
        } else if (audioRef.current.volume < 0.5 && audioRef.current.volume > 0.05) {
          setSpeakerIcon(iconPaths.midVolume);
        } else if (audioRef.current.volume <= 0.05) {
          setSpeakerIcon(iconPaths.lowVolume);
        }
      }
    };

    const handleUpdateProgress = () => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime;
        const percent = (current / getTotalDuration()) * 100;
        setProgressBarPercent(percent);
        setCurrentTime(formatTime(current));
      }
    };

    const handleLoadedMetaData = () => {
      if (audioRef.current?.duration && audioRef.current?.duration !== Infinity) {
        setTotalTime(formatTime(audioRef.current.duration ?? 0));
        const currentTime = audioRef.current.duration * coefficient;
        audioRef.current.currentTime = currentTime;
      }
    };

    function getVolumePath(volumeLevel: number) {
      const MIN_VOLUME = 0;
      const MAX_VOLUME = 100;

      volumeLevel = isNaN(volumeLevel) ? 100 : Math.max(MIN_VOLUME, Math.min(volumeLevel, MAX_VOLUME));

      if (volumeLevel >= 50) {
        return iconPaths.fullVolume;
      } else if (volumeLevel > 5) {
        return iconPaths.midVolume;
      }

      return iconPaths.lowVolume;
    }

    const togglePlay = () => {
      if (audioRef.current) {
        if (preload === 'none' && !audioRef.current.duration) {
          setCanPlay(false);
        }

        if (audioRef.current.paused) {
          play();
        } else {
          pause();
        }
      }
    };

    const play = () => {
      if (hasError) {
        handleReload();
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
        if (onPlay) {
          onPlay();
        }
      }
    };

    const pause = () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      if (onPause) {
        onPause();
      }
    };

    const stop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        audioRef.current.currentTime = 0;
      }
    };

    const focus = () => {
      wrapperRef.current?.focus();
    };

    const inRange = (event: MouseEvent | TouchEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const rangeBox = getRangeBox(event, currentlyDragged.current);
      const rect = rangeBox.getBoundingClientRect();
      const direction = rangeBox.dataset.direction;
      if (direction === 'horizontal') {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        if (clientX - rect.left < 0 || clientX - rect.right > 0) return false;
      } else {
        const min = rect.top;
        const max = min + rangeBox.offsetHeight;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        if (clientY < min || clientY > max) return false;
      }
      return true;
    };

    function getCoefficient(event: MouseEvent | TouchEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) {
      const slider = getRangeBox(event, currentlyDragged.current);
      const rect = slider.getBoundingClientRect();
      let K = 0;

      if (slider.dataset.direction === 'horizontal') {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const offsetX = clientX - rect.left;
        const width = slider.clientWidth;
        K = offsetX / width;
      } else if (slider.dataset.direction === 'vertical') {
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        const height = slider.clientHeight;
        const offsetY = clientY - rect.top;
        K = 1 - offsetY / height;
      }

      return K;
    }

    const rewind = (event: MouseEvent | TouchEvent | React.MouseEvent<HTMLDivElement>) => {
      if (inRange(event) && audioRef.current) {
        if (preload === 'none' && !audioRef.current.duration) {
          setCanPlay(false);
          audioRef.current.load();
          setCoefficient(getCoefficient(event));
        } else if (audioRef.current.duration) {
          audioRef.current.currentTime = getTotalDuration() * getCoefficient(event);
        }
      }
    };

    const changeVolume = (event: MouseEvent | TouchEvent | React.MouseEvent<HTMLDivElement>) => {
      if (inRange(event) && audioRef.current) {
        audioRef.current.volume = getCoefficient(event);
      }
    };

    const handleRewindDragging = () => {
      currentlyDragged.current = rewindPin.current;
      const events = getDeviceEventNames();
      window.addEventListener(events.move, rewind, false);

      window.addEventListener(
        events.up,
        () => {
          currentlyDragged.current = null;
          window.removeEventListener(events.move, rewind, false);
        },
        { once: true }
      );
    };

    const handleVolumeDragging = () => {
      currentlyDragged.current = volumePin.current;
      const events = getDeviceEventNames();

      window.addEventListener(events.move, changeVolume, false);

      window.addEventListener(
        events.up,
        () => {
          currentlyDragged.current = null;
          window.removeEventListener(events.move, changeVolume, false);
        },
        false
      );
    };

    const adjustAudioTime = (percentage: number) => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime + getTotalDuration() * (percentage / 100);
        audioRef.current.currentTime = Math.min(currentTime, getTotalDuration());
      }
    };

    const adjustVolume = (delta: number) => {
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, audioRef.current.volume + delta));
      }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
      if (!hasKeyBindings) {
        return;
      }
      event.preventDefault();
      switch (event.key) {
        case 'ArrowLeft':
          adjustAudioTime(-5);
          break;
        case 'ArrowRight':
          adjustAudioTime(5);
          break;
        case 'ArrowUp':
          adjustVolume(0.05);
          break;
        case 'ArrowDown':
          adjustVolume(-0.05);
          break;
        case ' ':
          togglePlay();
          break;
        default:
          //Nothing to do
          break;
      }
    };

    const handleOnPlay = () => {
      setIsPlaying(true);
    };

    return (
      <div
        ref={wrapperRef}
        tabIndex={-1}
        onKeyDown={handleKeyPress}
        className={`rap-container ${className}`}
        style={{
          ...(backgroundColor ? { backgroundColor: backgroundColor } : {}),
          ...(color ? { color: color } : {}),
          ...(width ? { width: width, maxWidth: width } : {}),
          ...style
        }}
      >
        {hasError && (
          <span title="An error has occurred" className="rap-pp-button" onClick={handleReload}>
            <svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" className="rap-pp-icon">
              <path
                fill={color ?? '#566574'}
                d="M7.248 1.307A.75.75 0 118.252.193l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 01-1.004-1.114l1.29-1.161a4.5 4.5 0 103.655 2.832.75.75 0 111.398-.546A6 6 0 118.018 2l-.77-.693z"
              />
            </svg>
          </span>
        )}
        {!canPlay && !hasError && (
          <div className="rap-loading">
            <div className="rap-spinner"></div>
          </div>
        )}
        {canPlay && !hasError && (
          <div className="rap-pp-button" onClick={() => togglePlay()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24" className="rap-pp-icon">
              <path fill={color ?? '#566574'} fillRule="evenodd" d={isPlaying ? iconPaths.pause : iconPaths.play} />
            </svg>
          </div>
        )}

        <div className="rap-controls">
          <span className="rap-current-time">{currentTime}</span>
          <div className="rap-slider" data-direction="horizontal" onMouseDown={handleRewindDragging} onTouchStart={handleRewindDragging} onClick={rewind}>
            <div
              className="rap-progress"
              style={{
                ...{ width: progressBarPercent + '%' },
                ...(sliderColor ? { backgroundColor: sliderColor } : {})
              }}
            >
              <div
                ref={rewindPin}
                className="rap-pin"
                data-method="rewind"
                onMouseDown={handleRewindDragging}
                onTouchStart={handleRewindDragging}
                style={sliderColor ? { backgroundColor: sliderColor } : {}}
              ></div>
            </div>
          </div>
          {totalTime !== '--:--' && <span className="rap-total-time">{totalTime}</span>}
        </div>

        <div className="rap-volume">
          <div className={`rap-volume-btn ${volumeOpen ? 'rap-volume-open' : ''}`} onClick={() => setVolumeOpen((vol) => !vol)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill={volumeOpen ? sliderColor ?? '#007FFF' : color ?? '#566574'} fillRule="evenodd" d={speakerIcon} />
            </svg>
          </div>
          <div className={`${volumePlacement === 'bottom' ? 'rap-vol-placement-bottom' : 'rap-vol-placement-top'} ${!volumeOpen ? 'rap-hidden' : ''}`}>
            <div
              className={`rap-volume-controls`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="rap-slider" data-direction="vertical" onClick={changeVolume} onMouseDown={handleVolumeDragging} onTouchStart={handleVolumeDragging}>
                <div
                  className="rap-progress"
                  style={{
                    ...{ height: `${volumeProgress}%` },
                    ...(sliderColor ? { backgroundColor: sliderColor } : {})
                  }}
                >
                  <div
                    ref={volumePin}
                    className="rap-pin"
                    data-method="changeVolume"
                    style={sliderColor ? { backgroundColor: sliderColor } : {}}
                    onMouseDown={handleVolumeDragging}
                    onTouchStart={handleVolumeDragging}
                  ></div>
                </div>
              </div>
            </div>
            <div className="rap-backdrop" onClick={() => setVolumeOpen(false)}></div>
          </div>
        </div>

        <audio
          loop={loop}
          ref={audioRef}
          preload={preload}
          autoPlay={autoPlay}
          onPlay={handleOnPlay}
          onEnded={handleEnded}
          onError={handleOnError}
          onCanPlay={handleCanPlay}
          onLoadedMetadata={handleLoadedMetaData}
          onTimeUpdate={handleUpdateProgress}
          onVolumeChange={handleUpdateVolume}
        >
          <source src={src} type="audio/mpeg" />
        </audio>
      </div>
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';
