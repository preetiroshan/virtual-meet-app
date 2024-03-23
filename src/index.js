import "./styles.css";

const iceServersConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

let localStream;

const createPeerConnection = async () => {
  const peerConnection = new RTCPeerConnection(iceServersConfig);
  const remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    console.log("localstream track", track);
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    const eventStream = event.streams[0];
    // add tracks of this stream to remote stream video
    eventStream.getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("New ice candidate", event.candidate);
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer); // This fires onicecandidate event
  console.log("Offer", offer);
};

const init = async () => {
  console.log("init called");
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  document.getElementById("user-1").srcObject = localStream;
  await createPeerConnection();
};

init();
