"use client";
import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useState,
  useEffect,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "./LoginButton";
import { CgSpinner } from "react-icons/cg";

type LocalStreamProviderProps = {
  children?: ReactNode;
};

const LocalStreamContext = createContext<MediaStream | null>(null);

export const LocalStreamProvider = ({
  children,
}: LocalStreamProviderProps): JSX.Element => {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [requested, setRequested] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  useEffect(() => {
    navigator.permissions.query({ name: "camera" }).then((res) => {
      if (res.state == "granted") {
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true,
            /*{
              mandatory: {
                minWidth: "1920",
                maxWidth: "1920",
                minHeight: "1080",
                maxHeight: "1080",
                minFrameRate: "30",
              },
              optional: [],
            },*/
          })
          .then((stream) => setLocalStream(stream));
      }
    });
  }, []);

  if (localStream == undefined || waitingForConfirmation) {
    // overlay with modal that asks for camera/mic permissions
    return (
      <div className="w-full h-full flex items-center justify-center bg-[rgba(0,0,0,0.5)] absolute top-0 left-0 z-10">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Please allow camera and microphone access</CardTitle>
          </CardHeader>
          <CardContent>
            {requested ? (
              localStream ? (
                <div>
                  <video
                    autoPlay
                    muted
                    className="h-128 bg-black rounded-xl overflow-hidden mb-5"
                    ref={(ref) => {
                      if (ref) ref.srcObject = localStream;
                    }}
                  />
                  Are you ready?
                  <div className="flex flex-row justify-end">
                    <Button
                      className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        setWaitingForConfirmation(false);
                      }}
                    >
                      Yes, I'm ready
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  Requesting permissions...{" "}
                  <CgSpinner className="animate-spin" />
                </div>
              )
            ) : (
              <Button
                onClick={async () => {
                  if (requested) return;
                  setWaitingForConfirmation(true);
                  setRequested(true);
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      video: true,
                      audio: true,
                    });
                    setLocalStream(stream);
                  } catch (err) {
                    console.error("Error accessing media devices.", err);
                    alert(
                      "Error accessing media devices. Please check permissions."
                    );
                  }
                }}
              >
                Request permissions
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <LocalStreamContext.Provider value={localStream}>
      {children}
    </LocalStreamContext.Provider>
  );
};

export const useLocalStream = (): MediaStream | null => {
  return useContext(LocalStreamContext);
};
