import React, { useContext, useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { LockClosedIcon } from "@heroicons/react/solid";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";

import { ProfileContext } from "../../../components/layout";

type Inputs = {
  title: String;
  content: string;
};

const CREATE_COMMENT = gql`
  mutation createComment(
    $title: String!
    $content: String!
    $authorId: Int!
    $postId: Int!
  ) {
    createComment(
      title: $title
      content: $content
      authorId: $authorId
      postId: $postId
    ) {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

export default function CreateComment() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const context = useContext(ProfileContext);

  const router = useRouter();
  const blogId = router.query.id;

  if (!blogId) return null;

  const [createComment, { data, loading, error }] = useMutation(CREATE_COMMENT);

  const onSubmit: SubmitHandler<Inputs> = (post) => {
    createComment({
      variables: {
        title: post.title,
        content: post.content,
        authorId: context.id,
        postId: Number(blogId),
      },
    }).then(({ data: { createComment } }) => {
      if (createComment.id) {
        toast.success("Created successfully!");
      } else {
        toast.error("Failed!");
      }
    });
  };

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog detail</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="px-4 py-6 sm:px-0">
            <form
              className="mt-8 space-y-6"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="name" className="sr-only">
                    Title
                  </label>
                  <input
                    {...register("title", { required: true })}
                    autoComplete="name"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Title"
                  />
                  {errors.title && <span>This field is required.</span>}
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Content
                  </label>
                  <textarea
                    {...register("content", { required: true })}
                    autoComplete="content"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Content"
                  />
                  {errors.content && <span>This field is required.</span>}
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
                  {loading ? "Creating..." : "Create comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
