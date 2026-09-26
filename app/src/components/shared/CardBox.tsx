import React from "react";
import { Card } from "../ui/card";

interface MyAppProps {
  children: React.ReactNode;
  className?: string;
}
const CardBox: React.FC<MyAppProps> = ({ children, className }) => {
  return (
    <Card className={`light-panel-inner card no-inset no-ring ${className} shadow-none border border-gray-200 dark:border-white/10 rounded-2xl w-full`}>
      {children}
    </Card>
  );

};
export default CardBox;
