import React from "react";

const DebugMsgContext = React.createContext();

function useDebugMsg() {
  const context = React.useContext(DebugMsgContext);
  if (!context) {
    throw new Error(`useDebugMsg must be used within a DebugMsgProvider`)
  }
  return context;
}

function DebugMsgProvider(props) {
  const [debugMsg, setDebugMsg] = React.useState([]); // list of strings in message
  const appendDebugMsg = (msg) => {
    setDebugMsg(prevMsgState => [...prevMsgState , msg]);
  }
  const value = React.useMemo(() => [debugMsg, appendDebugMsg], [debugMsg])
  return <DebugMsgContext.Provider value={value} {...props} />
}

export {DebugMsgProvider, useDebugMsg}