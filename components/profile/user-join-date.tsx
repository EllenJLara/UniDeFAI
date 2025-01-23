import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";

export const UserJoinDate = ({
  date,
  showIcon = true,
}: {
  date: Date | undefined;
  showIcon?: boolean;
}) => {
  return (
    <>
      <div className="flex flex-row text-sm gap-1 text-light-gray text-center justify-center">
        {showIcon && <CalendarDays size={16}/>}
        <span>pumping since {dayjs(date).format("MMMM DD")},&nbsp;{dayjs(date).format("YYYY")}</span>
      </div>
    </>
  );
};
