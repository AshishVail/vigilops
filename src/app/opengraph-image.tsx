import { ImageResponse } from "next/og";
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", background:"#07090D", color:"#F8FAFC", padding:"80px" }}><div style={{ fontSize:84, fontWeight:700 }}>VigilOps</div><div style={{ marginTop:24, color:"#06B6D4", fontSize:34 }}>Monitor. Test. Secure. Resolve.</div></div>, size);
}
