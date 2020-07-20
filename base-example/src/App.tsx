import React, { useRef, useCallback, useEffect, useState } from "react";
import "./App.css";
import { WebBroker } from "web-broker";
const urlParams = new URLSearchParams(window.location.search);
const nodeId = urlParams.get("nodeId") || 0;
const level = parseInt(urlParams.get("level") as string) || 0;
const limit = 3;
const webBroker = new WebBroker(nodeId + "", "debug");
const eventBus = webBroker.eventBus;
const queryBus = webBroker.queryBus;
//ss
function App() {
  const iframeRef1 = useRef(null);
  const iframeRef2 = useRef(null);
  const pingIdRef = useRef("");
  const onLoad = useCallback(() => {
    if (iframeRef1.current !== null)
      webBroker.connectChild(
        (iframeRef1.current as unknown) as HTMLIFrameElement
      );
    if (iframeRef2.current !== null)
      webBroker.connectChild(
        (iframeRef2.current as unknown) as HTMLIFrameElement
      );
  }, []);
  const [status, setStatus] = useState("");
  const [fromNodeId, setFromId] = useState("");
  useEffect(() => {
    eventBus.subscribe("statusChanged", (data) => {
      console.log(data);
      setStatus(data);
    });
    queryBus.addQueryHandler("ping", ({ nodeId: fromNodeId }) => {
      setFromId(fromNodeId);
    });
  }, []);
  return (
    <div className="App">
      node id#{nodeId}
      <br />
      <input
        value={status}
        type="text"
        placeholder="write global status"
        onInput={(e) =>
          eventBus.publish("statusChanged", (e.target as any).value)
        }
      />
      <br />
      <div>
        <input
          placeholder="#"
          onInput={(e) => (pingIdRef.current = (e.target as any).value)}
        />{" "}
        <button
          onClick={() => {
            queryBus.query(`${pingIdRef.current}.ping`, { nodeId });
          }}
        >
          Ping!
        </button>
      </div>
      <br />
      message from : {fromNodeId}
      <br />
      {level <= limit && (
        <div style={{ width: "100%", display: "flex" }}>
          <iframe
            width="50%"
            height="500"
            onLoad={onLoad}
            key={`${level}.1`}
            ref={iframeRef1}
            src={`http://localhost:3000?nodeId=${nodeId}.1&level=${level + 1}`}
          />
          <iframe
            width="50%"
            height="500"
            key={`${level}.2`}
            onLoad={onLoad}
            ref={iframeRef2}
            src={`http://localhost:3000?nodeId=${nodeId}.2&level=${level + 1}`}
          />
        </div>
      )}
    </div>
  );
}

export default App;
