import "./styles.css";
import AgoraRTM from "./agora-rtm-sdk-1.4.4";
import { IMessageFromPeer } from "./types";
import { controlIcons } from "./utils";
import { colors } from "./constants";

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
let remoteStream: MediaStream;
let client: any, channel: any;
let peerConnection: RTCPeerConnection;
const user1Display = document.getElementById("user-1") as HTMLMediaElement;
const user2Display = document.getElementById("user-2") as HTMLMediaElement;

console.log("@debug-agora logs", { AgoraRTM });
const roomId = new URLSearchParams(window.location.search).get("roomId");
if (!roomId) {
  window.location.pathname = "/lobby.html";
}

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

  channel.on("MemberLeft", handleUserLeave);

  client.on("MessageFromPeer", handleMessageFromPeer);

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  user1Display.srcObject = localStream;
};

init();

async function createPeerConnection(memberId: string) {
  peerConnection = new RTCPeerConnection(iceServersConfig);
  remoteStream = new MediaStream();
  console.log("media stream", remoteStream.active);
  user2Display.srcObject = remoteStream;
  user2Display.style.display = "block";

  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    user1Display.srcObject = localStream;
  }

  localStream.getTracks().forEach((track) => {
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
    const { candidate } = event;
    if (candidate) {
      console.log("@debug-New ice candidate", candidate);
      client.sendMessageToPeer(
        { text: JSON.stringify({ type: "candidate", candidate }) },
        memberId
      );
    }
  };
}

async function createOffer(memberId: string) {
  await createPeerConnection(memberId);

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer); // This fires onicecandidate event

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "offer", offer: offer }) },
    memberId
  );
  console.log("@debug-Offer", offer);
}

async function createAnswer(
  memberId: string,
  offer: RTCSessionDescriptionInit
) {
  await createPeerConnection(memberId);
  await peerConnection.setRemoteDescription(offer); // This fires onicecandidate event

  const answer = await peerConnection.createAnswer();
  console.log("@debug-answer", { ...answer });
  await peerConnection.setLocalDescription(answer); // T
  answer &&
    client.sendMessageToPeer(
      { text: JSON.stringify({ type: "answer", answer: answer }) },
      memberId
    );
}

async function handleUserJoined(memberId: string) {
  console.log("@debug-New member joined", memberId);
  // create an offer when a member joins
  await createOffer(memberId);
}

async function addAnswer(answer: RTCSessionDescriptionInit) {
  if (!peerConnection.currentRemoteDescription) {
    // console.log("answer old", answer.sdp);
    // answer.sdp += "\n";
    // console.log("answer new", answer.sdp);
    await peerConnection.setRemoteDescription(answer);
  }
}
async function handleMessageFromPeer(
  message: { text: string },
  memberId: string
) {
  console.log("@debug-Message from peer", message);
  const messageContent = JSON.parse(message.text) as IMessageFromPeer;
  // todo check nesting
  switch (messageContent.type) {
    case "offer": {
      createAnswer(memberId, messageContent.offer);
      break;
    }
    case "answer": {
      addAnswer(messageContent.answer);
      break;
    }

    case "candidate": {
      if (peerConnection) {
        peerConnection.addIceCandidate(messageContent.candidate);
        break;
      }
    }
  }
}

async function handleUserLeave() {
  console.log("@debug-handle user leave");
  user2Display.style.display = "none";
}

async function leaveChannel() {
  await channel.leave();
  await client.logout();
}

window.addEventListener("beforeunload", () => {
  leaveChannel();
});

const controls = document.getElementsByClassName("controls-container");
Array.prototype.forEach.call(controls, (control: any) => {
  control.addEventListener("click", () => {
    const controlImg = control.getElementsByTagName("img")?.[0];
    const controlId = control.getAttribute("id");
    if (controlId === "end-call") {
      leaveChannel();
      window.location = "/lobby.html" as unknown as Location;
      return;
    }
    const currentState = controlImg.getAttribute("src").includes("On")
      ? "ON"
      : "OFF";
    const newState = currentState === "ON" ? "OFF" : "ON";
    const newImg = controlIcons[controlId][newState];
    controlImg.src = newImg;
    control.style.backgroundColor = colors[newState === "ON" ? "white" : "red"];
    toggleControl(controlId);
  });
});

const toggleControl = async (controlId: string) => {
  const toggleFunc =
    localStream[controlIcons[controlId].onToggle].bind(localStream);
  toggleFunc().forEach((track: any) => {
    const currentStatus = !!track.enabled;
    track.enabled = !currentStatus;
  });
};
