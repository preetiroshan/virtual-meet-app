export type IMessageFromPeer = {
  type: "offer" | "answer" | "candidate";
  offer?: any;
  answer?: any;
  candidate?: any;
};
