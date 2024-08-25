import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { WebMidi } from 'webmidi';
import AudioRecorder from './AudioRecorder';

const Synthesizer = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [savedRecording, setSavedRecording] = useState(null); // State to store saved recording
  const [midiInputs, setMidiInputs] = useState([]);
  const [selectedMidiInput, setSelectedMidiInput] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setAudioFile(file);
  };

  const startLoop = async () => {
    if (audioFile && !isPlaying) {
      const url = URL.createObjectURL(audioFile);

      // Create a new Tone.Player instance and load the audio file
      const newPlayer = new Tone.Player({
        url,
        loop: true,  // Loop the audio file
        autostart: true,
      }).toDestination();

      setPlayer(newPlayer);
      setIsPlaying(true);
    }
  };

  const stopLoop = () => {
    if (isPlaying && player) {
      player.stop();
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        setRecordedChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setSavedRecording(url); // Save the recording URL
        setRecordedChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    // Initialize MIDI
    WebMidi.enable((err) => {
      if (err) {
        console.error('WebMidi could not be enabled.', err);
        return;
      }

      setMidiInputs(WebMidi.inputs);

      if (WebMidi.inputs.length > 0) {
        setSelectedMidiInput(WebMidi.inputs[0]);

        WebMidi.inputs[0].addListener('noteon', 'all', (e) => {
          console.log(`Received MIDI note ${e.note.name}${e.note.octave}`);
        });
      }
    });

    return () => {
      WebMidi.disable();
    };
  }, []);

  return (
    <div className='Amrit' style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Audio Looper</h1>
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      <div style={{ marginTop: '20px' }}>
        <button onClick={startLoop} className="btn" style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}>
          Play Loop
        </button>
        <button onClick={stopLoop} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Stop Loop
        </button>
      </div>

      
     

     

     <AudioRecorder/>
    </div>
  );
};

export default Synthesizer;
