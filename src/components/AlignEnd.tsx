import React from "react";

export const AlignEnd: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // 右端・下端寄せ用の小さなラッパー
  return <div className="self-end">{children}</div>;
};
