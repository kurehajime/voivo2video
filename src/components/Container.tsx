import React from "react";

export const InputContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // 入力エリア用の共通コンテナ
  return (
    <div className="border border-unfocused-border-color p-geist rounded-geist bg-background flex flex-col">
      {children}
    </div>
  );
};
