import React from "react";
import { useUsers } from "../profile/hooks/use-users";
import Person from "./person";
import Link from "next/link";
import LoadingSpinner from "../elements/loading/loading-spinner";
import TryAgain from "../elements/try-again";

const Connect = () => {
  const {
    data: people = [],
    isLoading,
    isError,
  } = useUsers({ queryKey: ["people-to-follow"], limit: 3 });

  console.log(people);

  return (
    <section aria-label="Who to follow" className="">
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <TryAgain />
      ) : (
        <>
          <h2 className="text-lg py-3 px-4 font-semibold">Who to follow</h2>

          {Array.isArray(people) && people.length > 0 ? (
            people.map((person) => {
              return <Person key={person?.id} person={person} />;
            })
          ) : (
            <p>No people available to follow</p>
          )}

          <Link
            className="block p-[1em] cursor-pointer rounded-b-2xl hover:bg-slate-500/10 text-[15px]"
            href={`/people`}
          >
            <span className="text-sky-500"> Show more</span>
          </Link>
        </>
      )}
    </section>
  );
};

export default Connect;
