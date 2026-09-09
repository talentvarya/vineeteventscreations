import { createContext, useContext, useState } from "react";

const EnquiryContext = createContext(null);

export const EnquiryProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState({});

  const openEnquiry = (data = {}) => {
    setPrefill(data);
    setOpen(true);
  };

  return (
    <EnquiryContext.Provider value={{ open, setOpen, prefill, openEnquiry }}>
      {children}
    </EnquiryContext.Provider>
  );
};

export const useEnquiry = () => useContext(EnquiryContext);
