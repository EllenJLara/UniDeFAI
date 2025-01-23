"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { useGetFollows } from "./hooks/use-get-follows";
import NoFollowers from "./no-followers";
import PersonDetails from "../connect/person-details";
import { useUser } from "./hooks/use-user";

const Followers = () => {
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  if (!id) {
    return null;
  }

  const { data: user } = useUser({ id });
  const {
    data: follows,
    isError,
    isLoading,
  } = useGetFollows({ id, type: "followers" });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading followers. Please try again.</div>;
  }

  return (
    <>
      {follows?.length === 0 ? (
        <NoFollowers
          title={`Looking for followers?`}
          subtitle={`When someone follows this account, they'll show up here. Tweeting
            and interacting with others helps boost followers.`}
        />
      ) : (
        follows?.map((user) => {
          return <PersonDetails key={user?.id} author={user} />;
        })
      )}
    </>
  );
};

export default Followers;
