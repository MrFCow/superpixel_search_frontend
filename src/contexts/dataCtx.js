import React from "react";

const DataContext = React.createContext();

function useData() {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error(`useData must be used within a DataProvider`)
  }
  return context;
}

function DataProvider(props) {
  const [data, setData] = React.useState({}); // empty object
  const updateData = (newData) => {
    setData(prevDataState => ({...prevDataState, ...newData}));
  }
  const value = React.useMemo(() => [data, updateData], [data])
  return <DataContext.Provider value={value} {...props} />
}

export {DataProvider, useData}