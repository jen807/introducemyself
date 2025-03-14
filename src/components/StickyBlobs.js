import { useEffect, useState } from "react";
import introduceImage from "../imgs/introduce.jpeg"; // ✅ 이미지 import

export default function StickyBlobs() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ 반응형 크기 조절 (화면 크기 변경 감지)
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ 반응형 적용 (가로가 400px 이하일 때 크기 조정)
  const isMobile = windowWidth <= 400;

  // ✅ A4 박스 크기 (PC는 기존 크기 유지, 모바일만 훨씬 크게!)
  const boxWidth = isMobile ? 80 * windowWidth / 100 : 40 * windowWidth / 100;
  const boxHeight = boxWidth * 1.41; // ✅ A4 비율 유지 (1:1.41)
  const padding = 10;

  // ✅ A4 박스 중앙 정렬
  const [boxPos, setBoxPos] = useState({
    x: windowWidth / 2 - boxWidth / 2,
    y: window.innerHeight / 2 - boxHeight / 2
  });

  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const generateBlob = (id) => ({
    id,
    x: Math.random() * (window.innerWidth - 200) + 100,
    y: Math.random() * (window.innerHeight - 200) + 100,
    r: isMobile ? Math.random() * 40 + 40 : Math.random() * 100 + 100, // ✅ 모바일에서는 원형 크기 증가 (40~80px)
    directionX: Math.random() * 2 - 1,
    directionY: Math.random() * 2 - 1,
    speedX: Math.random() * 0.1 + 0.05, // ✅ 이동 속도 그대로 유지
    speedY: Math.random() * 0.1 + 0.05, // ✅ 이동 속도 그대로 유지
  });

  const initialBlobs = Array.from({ length: 8 }, (_, i) => generateBlob(i + 1));
  const [blobs, setBlobs] = useState(initialBlobs);

  useEffect(() => {
    const animate = () => {
      setBlobs((prev) =>
        prev.map((blob) => {
          let newX = blob.x + blob.directionX * blob.speedX;
          let newY = blob.y + blob.directionY * blob.speedY;

          if (newX - blob.r < 0) {
            blob.directionX *= -1;
            newX = blob.r;
          }
          if (newX + blob.r > window.innerWidth) {
            blob.directionX *= -1;
            newX = window.innerWidth - blob.r;
          }
          if (newY - blob.r < 0) {
            blob.directionY *= -1;
            newY = blob.r;
          }
          if (newY + blob.r > window.innerHeight) {
            blob.directionY *= -1;
            newY = window.innerHeight - blob.r;
          }

          return { ...blob, x: newX, y: newY };
        })
      );

      requestAnimationFrame(animate);
    };

    animate();
  }, []); // ✅ 이동 속도 수정 X

  // 🟢 마우스 클릭 시 드래그 시작
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - boxPos.x,
      y: e.clientY - boxPos.y,
    });
  };

  // 🟢 마우스 이동 시 박스 위치 업데이트
  const handleMouseMove = (e) => {
    if (isDragging) {
      setBoxPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  // 🟢 마우스 버튼을 놓으면 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <svg 
      width="100vw" height="100vh" 
      style={{ background: "#ffffff" }} 
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>

        {/* 🔥 그림자 효과 추가 */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity="0.2" />
        </filter>
      </defs>

      <g filter="url(#goo)">
        {blobs.map((blob) => (
          <circle key={blob.id} cx={blob.x} cy={blob.y} r={blob.r} fill="#C4D6A0" />
        ))}
      </g>

      {/* 🟢 중앙 A4 비율 흰색 박스 (드래그 가능) */}
      <g 
        onMouseDown={handleMouseDown} // 드래그 시작 이벤트
        style={{ cursor: "grab" }}
      >
        {/* 박스 배경 */}
        <rect
          x={boxPos.x}
          y={boxPos.y} 
          width={boxWidth} height={boxHeight} 
          fill="white"
          rx="10"
          filter="url(#shadow)"
        />

        {/* 🔥 박스 안에 패딩을 적용한 이미지 추가 (SVG <image> 태그 사용) */}
        <image
          href={introduceImage}  // ✅ import한 이미지 사용
          x={boxPos.x + padding} 
          y={boxPos.y + padding}
          width={boxWidth - padding * 2} 
          height={boxHeight - padding * 2}
          preserveAspectRatio="xMidYMid meet"  // ✅ 이미지 비율 유지
        />
      </g>
    </svg>
  );
}
