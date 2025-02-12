import { Howl } from "howler";
import jumpSoundFile from "./assets/jump.mp3";
import yaySoundFile from "./assets/yay.mp3";
import hugSoundFile from "./assets/hug.mp3";

const jumpSound = new Howl({ src: [jumpSoundFile] });
const yaySound = new Howl({ src: [yaySoundFile] });
const hugSound = new Howl({ src: [hugSoundFile] });

const SoundEffects = {
  playJump: () => jumpSound.play(),
  playYay: () => yaySound.play(),
  playHug: () => hugSound.play(),
};

export default SoundEffects;
