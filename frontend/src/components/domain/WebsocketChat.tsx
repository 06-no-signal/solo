import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Card, CardContent, CardFooter } from "../ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const WebsocketChat: FC<{
  ws: Socket;
  roomId: string;
  className?: string;
}> = ({ ws, roomId, className }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const scrollableDiv = useRef<HTMLDivElement>(null);

  const onChat = useCallback((data: any) => {
    setMessages((prev) => [...prev, data.message]);
  }, []);

  useEffect(() => {
    ws.on("chat", onChat);

    return () => {
      ws.off("chat", onChat);
    };
  }, [ws]);

  useEffect(() => {
    if (scrollableDiv.current) {
      scrollableDiv.current.scrollTop = scrollableDiv.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    ws.emit("chat", { message: input, target: roomId });
    setInput("");
  };

  return (
    <Card
      className={cn(
        "overflow-hidden w-full h-full rounded-none border-0 shadow-none",
        className
      )}
    >
      <CardContent className="shrink overflow-auto grow" ref={scrollableDiv}>
        {messages.map((msg, index) => (
          <div className="" key={index}>
            {msg}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <form
          className="grow p-4"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <InputGroup>
            <InputGroupInput
              placeholder="Chat..."
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                className="rounded-full cursor-pointer"
                size="icon-xs"
                onClick={sendMessage}
              >
                <ArrowRightIcon />
                <span className="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </CardFooter>
    </Card>
  );
};
