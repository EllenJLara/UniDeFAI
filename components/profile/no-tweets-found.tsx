import React from "react";

const NoTweetsFound = ({
  username,
  label,
  label_short,
}: {
  username: string | null;
  label?: string;
  label_short?: string;
}) => {
  return (
    <div className="grid place-content-center">
      <div className="max-w-[380px] p-[30px] ">
        <span className="flex text-2xl font-bold justify-center ">
          @{username}
        </span>
        <p className="flex text-2xl font-bold  justify-center ">
          hasn't {label}
        </p>
        <span className="text-sm text-light-gray tracking-tight justify-center text-center">
          When they do, their {label_short} will show up here.
        </span>
      </div>
    </div>
  );
};

export default NoTweetsFound;
