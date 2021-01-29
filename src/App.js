import FPSStats from "react-fps-stats";

import MainContainer from "./components/mainContainer";

import {DebugMsgProvider} from "./contexts/debugMsgCtx";
import {DataProvider} from "./contexts/dataCtx";

import DebugMsg from "./components/debugMsg";

// import testCode from "./testing/testingTfjs";

function App() {
  return (
    <>
      {/* <div onClick={testCode}>Test Tensorflow Code</div> */}
      <DebugMsgProvider>
        <DataProvider>
          <MainContainer/>
        </DataProvider>
          
        <DebugMsg/>
      </DebugMsgProvider>
      <FPSStats left="auto" top="auto" right={0} bottom={0}/>
    </>
  );
}

export default App;
