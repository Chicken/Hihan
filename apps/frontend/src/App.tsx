import { Comments } from "@/Comments.js";
import { Frontpage } from "@/Frontpage.js";
import { BrowserRouter, Route, Routes } from "react-router";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frontpage />} />
        <Route path="/comments/*" element={<Comments />} />
      </Routes>
    </BrowserRouter>
  );
}
