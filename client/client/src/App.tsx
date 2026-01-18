import { BrowserRouter, Routes, Route } from "react-router-dom";
import WebRTCTest from "./pages/webRTC";
import CallForm from "./pages/callForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CallForm />} />
        <Route path="/webrtc-test" element={<WebRTCTest />} />
      </Routes>
    </BrowserRouter>
  );
}
