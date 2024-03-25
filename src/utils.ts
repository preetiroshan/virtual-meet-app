import micOn from "./images/micOn.svg";
import micOff from "./images/micOff.svg";
import camOn from "./images/camOn.svg";
import camOff from "./images/camOff.svg";

export const controlIcons = {
  mic: {
    OFF: micOff,
    ON: micOn,
    onToggle: "getAudioTracks",
  },
  cam: {
    OFF: camOff,
    ON: camOn,
    onToggle: "getVideoTracks",
  },
};
