// main.tsx
import React from "react";
import { StrictMode } from "react";

import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ReactDom from "react-dom/client";

ReactDom.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);


