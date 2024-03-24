import "./styles.css";
import AgoraRTM from "./agora-rtm-sdk-1.4.4";

const iceServersConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};
const uid = String(Math.floor(Math.random() * 100000));
const APP_ID = process.env.APP_ID;

let localStream;
let client, channel;

console.log("agora logs", { AgoraRTM });

const init = async () => {
  const client = new AgoraRTM.createInstance(APP_ID);
  await client.login({
    uid,
    token: null,
  });

  // TODO: Handle room id
  const channel = await client.createChannel("main");
  channel.join();

  channel.on("MemberJoined", handleUserJoined);

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  document.getElementById("user-1").srcObject = localStream;
  await createPeerConnection();
};

init();

async function createPeerConnection() {
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
}

async function handleUserJoined(memberId) {
  console.log("New member joined", memberId);
}
