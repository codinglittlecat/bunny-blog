import React, { useContext } from "react";
import { LockClosedIcon } from "@heroicons/react/solid";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "@apollo/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import { ProfileContext } from "../../components/layout";

type Inputs = {
  name: String;
  email: string;
  password: string;
};

const DO_SIGNUP = gql`
  mutation SignupUser($name: String!, $email: String!, $password: String!) {
    signupUser(data: { name: $name, email: $email, password: $password }) {
      id
      name
      email
    }
  }
`;

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const context = useContext(ProfileContext);

  const [signupUser, { data, loading, error }] = useMutation(DO_SIGNUP);

  const router = useRouter();

  const onSubmit: SubmitHandler<Inputs> = (credential) => {
    signupUser({
      variables: {
        name: credential.name,
        email: credential.email,
        password: credential.password,
      },
    }).then(({ data }) => {
      toast.success("Sign up successfully!");
      router.push("/sign-in");
    });
  };

  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt="Workflow"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign up to your account
            </h2>
          </div>
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  {...register("name", { required: true })}
                  autoComplete="name"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Name"
                />
                {errors.name && <span>This field is required.</span>}
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  {...register("email", { required: true })}
                  autoComplete="email"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                {errors.email && <span>This field is required.</span>}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  {...register("password", { required: true })}
                  autoComplete="current-password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  type="password"
                />
                {errors.password && <span>This field is required.</span>}
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-3 ..."
                      viewBox="0 0 24 24"
                    ></svg>
                  ) : (
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  )}
                </span>
                {loading ? "Signing up" : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
