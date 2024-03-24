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

let localStream: MediaStream;
let client: any, channel;
const user1Display = document.getElementById("user-1") as HTMLMediaElement;
const user2Display = document.getElementById("user-2") as HTMLMediaElement;

console.log("@debug-agora logs", { AgoraRTM });

const init = async () => {
  // @ts-ignore
  client = new AgoraRTM.createInstance(APP_ID);
  await client.login({
    uid,
    token: null,
  });

  // TODO: Handle room id
  channel = await client.createChannel("main");
  channel.join();

  channel.on("MemberJoined", handleUserJoined);

  client.on("MessageFromPeer", handleMessageFromPeer);

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  user1Display.srcObject = localStream;
};

init();

async function createOffer(memberId: string) {
  const peerConnection = new RTCPeerConnection(iceServersConfig);
  const remoteStream = new MediaStream();
  user2Display.srcObject = remoteStream;

  localStream &&
    localStream.getTracks().forEach((track) => {
      console.log("@debug-localstream track", track);
      peerConnection.addTrack(track, localStream);
    });

  // This is triggered when tracks are received from peer. These tracks need to be added in the remote stream element
  peerConnection.ontrack = (event) => {
    const eventStream = event.streams[0];
    // add tracks of this stream to remote stream video
    eventStream.getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("@debug-New ice candidate", event.candidate);
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer); // This fires onicecandidate event

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "offer" }) },
    memberId
  );
  console.log("@debug-Offer", offer);
}

async function handleUserJoined(memberId: string) {
  console.log("@debug-New member joined", memberId);
  // create an offer when a member joins
  await createOffer(memberId);
}
async function handleMessageFromPeer(message: string, memberId: string) {
  console.log("@debug-Message from peer", message);
}
